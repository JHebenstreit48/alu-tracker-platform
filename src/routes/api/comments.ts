import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import crypto from "node:crypto";
import {
  createComment,
  getVisibleCommentsBySlug,
  adminListComments,
  getCommentWithSecret,
  updateComment,
  deleteComment,
  claimCommentsByEmail,
  type CommentStatus,
} from "@/comments/firestore";

const router = Router();

const AUTO_VISIBLE =
  process.env.COMMENTS_AUTO_VISIBLE === "true";
const ADMIN_KEY = process.env.COMMENTS_ADMIN_KEY || "";

// Rate limit on create
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const createCommentSchema = z.object({
  normalizedKey: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(120).optional(),
  model: z.string().trim().max(120).optional(),
  type: z.enum(["missing-data", "correction", "general"]),
  body: z
    .string()
    .min(5)
    .max(2000)
    .transform((s) => s.replace(/\s+/g, " ").trim()),
  authorName: z.string().trim().max(120).optional(),
  authorEmail: z
    .string()
    .trim()
    .max(254)
    .email("Invalid email")
    .optional(),
  hp: z.string().optional(),
});

const selfEditSchema = z.object({
  body: z
    .string()
    .min(5)
    .max(2000)
    .transform((s) => s.replace(/\s+/g, " ").trim()),
  editKey: z.string().optional(),
});

const selfDeleteSchema = z.object({
  editKey: z.string().optional(),
});

function requireAdminKey(req: Request, res: Response): boolean {
  if (!ADMIN_KEY) {
    res
      .status(501)
      .json({
        ok: false,
        error: {
          code: "NOT_CONFIGURED",
          message: "Set COMMENTS_ADMIN_KEY",
        },
      });
    return false;
  }
  if (req.header("x-admin-key") !== ADMIN_KEY) {
    res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Invalid admin key" },
      });
    return false;
  }
  return true;
}

function sha256Hex(input: string): string {
  return crypto
    .createHash("sha256")
    .update(input, "utf8")
    .digest("hex");
}

/* ===== ADMIN ===== */

router.get("/admin/list", async (req, res) => {
  if (!requireAdminKey(req, res)) return;

  const { status, slug, limit } = req.query as {
    status?: CommentStatus;
    slug?: string;
    limit?: string;
  };

  const lim = Math.min(
    Math.max(parseInt(String(limit ?? "200"), 10) || 200, 1),
    500
  );

  const items = await adminListComments({
    status,
    slug,
    limit: lim,
  });

  res.json({ ok: true, data: { items } });
});

router.patch("/:id/visible", async (req, res) => {
  if (!requireAdminKey(req, res)) return;
  const ok = await updateComment(req.params.id, { status: "visible" });
  if (!ok) {
    res
      .status(404)
      .json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Comment not found" },
      });
    return;
  }
  res.json({ ok: true });
});

router.patch("/:id/hide", async (req, res) => {
  if (!requireAdminKey(req, res)) return;
  const ok = await updateComment(req.params.id, { status: "hidden" });
  if (!ok) {
    res
      .status(404)
      .json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Comment not found" },
      });
    return;
  }
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  if (!requireAdminKey(req, res)) return;
  const ok = await deleteComment(req.params.id);
  if (!ok) {
    res
      .status(404)
      .json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Comment not found" },
      });
    return;
  }
  res.json({ ok: true });
});

/* ===== PUBLIC ===== */

// GET /api/comments/:slug
router.get("/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) {
      res
        .status(400)
        .json({
          ok: false,
          error: { code: "BAD_REQUEST", message: "Missing slug" },
        });
      return;
    }

    const comments = await getVisibleCommentsBySlug(slug);
    res.json({ ok: true, data: { comments } });
  } catch (err) {
    console.error("GET /api/comments/:slug", err);
    res
      .status(500)
      .json({
        ok: false,
        error: { code: "SERVER_ERROR", message: "Unexpected error" },
      });
  }
});

// POST /api/comments
router.post("/", limiter, async (req, res) => {
  try {
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.flatten(),
          },
        });
      return;
    }

    const { hp, ...data } = parsed.data;
    if (hp && hp.trim() !== "") {
      res.json({ ok: true }); // honeypot
      return;
    }

    const editKey = crypto.randomBytes(24).toString("hex");
    const status = AUTO_VISIBLE ? "visible" : "pending";

    const created = await createComment({
      ...data,
      editKeyHash: sha256Hex(editKey),
      status,
    });

    console.log(
      `[comments] created id=${created.id} key=${data.normalizedKey} status=${created.status}`
    );

    res.json({
      ok: true,
      data: {
        id: created.id,
        status: created.status,
        editKey,
      },
    });
  } catch (err) {
    console.error("POST /api/comments", err);
    res
      .status(500)
      .json({
        ok: false,
        error: { code: "SERVER_ERROR", message: "Unexpected error" },
      });
  }
});

/* ===== SELF (guest edit/delete via editKey) ===== */

router.patch("/:id/self", async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = selfEditSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
          },
        });
      return;
    }

    const doc = await getCommentWithSecret(id);
    if (!doc || !doc.editKeyHash) {
      res
        .status(404)
        .json({
          ok: false,
          error: { code: "NOT_FOUND", message: "Comment not found" },
        });
      return;
    }

    const ok =
      !!parsed.data.editKey &&
      sha256Hex(parsed.data.editKey) === doc.editKeyHash;

    if (!ok) {
      res
        .status(403)
        .json({
          ok: false,
          error: { code: "FORBIDDEN", message: "Not allowed" },
        });
      return;
    }

    await updateComment(id, { body: parsed.data.body });
    res.json({ ok: true, data: { id } });
  } catch (err) {
    console.error("PATCH /api/comments/:id/self", err);
    res
      .status(500)
      .json({
        ok: false,
        error: { code: "SERVER_ERROR", message: "Unexpected error" },
      });
  }
});

router.delete("/:id/self", async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = selfDeleteSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res
        .status(400)
        .json({
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
          },
        });
      return;
    }

    const doc = await getCommentWithSecret(id);
    if (!doc || !doc.editKeyHash) {
      res
        .status(404)
        .json({
          ok: false,
          error: { code: "NOT_FOUND", message: "Comment not found" },
        });
      return;
    }

    const ok =
      !!parsed.data.editKey &&
      sha256Hex(parsed.data.editKey) === doc.editKeyHash;

    if (!ok) {
      res
        .status(403)
        .json({
          ok: false,
          error: { code: "FORBIDDEN", message: "Not allowed" },
        });
      return;
    }

    await deleteComment(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/comments/:id/self", err);
    res
      .status(500)
      .json({
        ok: false,
        error: { code: "SERVER_ERROR", message: "Unexpected error" },
      });
  }
});

export default router;