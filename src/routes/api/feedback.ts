import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  createFeedback,
  listPublicFeedback,
  adminListFeedback,
  updateFeedback,
  deleteFeedback,
  type FeedbackRecord,
} from "@/comments/firestore";

const router = Router();
const ADMIN_KEY = process.env.FEEDBACK_ADMIN_KEY ?? "";

// Public POST limiter
const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const createSchema = z.object({
  category: z.enum(["bug", "feature", "content", "other"]),
  message: z
    .string()
    .min(5)
    .max(3000)
    .transform((s) => s.replace(/\s+/g, " ").trim()),
  email: z.string().email().max(254).optional(),
  pageUrl: z.string().url().max(2000).optional(),
  hp: z.string().optional(),
});

function requireAdmin(req: Request, res: Response): boolean {
  if (!ADMIN_KEY) {
    res
      .status(501)
      .json({
        ok: false,
        error: {
          code: "NOT_CONFIGURED",
          message: "Set FEEDBACK_ADMIN_KEY",
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

// POST /api/feedback
router.post("/", postLimiter, async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
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
      res.json({ ok: true });
      return;
    }

    await createFeedback({
      ...data,
      userAgent: req.headers["user-agent"] || undefined,
    });

    console.log(
      `[feedback] created category=${data.category} len=${data.message.length}`
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("POST /api/feedback", err);
    res
      .status(500)
      .json({
        ok: false,
        error: { code: "SERVER_ERROR", message: "Unexpected error" },
      });
  }
});

// GET /api/feedback/public
router.get("/public", async (req, res) => {
  try {
    const { mode, status, limit } = req.query as {
      mode?: "recent" | "all";
      status?: string;
      limit?: string;
    };

    type S = FeedbackRecord["status"];

    let allowed: S[] =
      mode === "all"
        ? ["new", "triaged", "closed"]
        : ["new", "triaged"];

    if (status) {
      const asked = status
        .split(",")
        .map((s) => s.trim())
        .filter(
          (s): s is S =>
            s === "new" || s === "triaged" || s === "closed"
        );
      if (asked.length) {
        allowed = asked.filter((s) => allowed.includes(s));
      }
    }

    const defLimit = mode === "recent" ? 20 : 100;
    const limParsed = parseInt(String(limit ?? defLimit), 10);
    const lim = Math.min(
      Math.max(Number.isFinite(limParsed) ? limParsed : defLimit, 1),
      200
    );

    const items = await listPublicFeedback({
      statuses: allowed,
      limit: lim,
    });

    res.json({ ok: true, data: { items } });
  } catch (err) {
    console.error("GET /api/feedback/public", err);
    res
      .status(500)
      .json({
        ok: false,
        error: { code: "SERVER_ERROR", message: "Unexpected error" },
      });
  }
});

// GET /api/feedback/admin/list
router.get("/admin/list", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { status, limit } = req.query as {
    status?: "new" | "triaged" | "closed" | "all";
    limit?: string;
  };

  const limParsed = parseInt(String(limit ?? "200"), 10);
  const lim = Math.min(
    Math.max(Number.isFinite(limParsed) ? limParsed : 200, 1),
    500
  );

  const items = await adminListFeedback({
    status: status ?? "all",
    limit: lim,
  });

  res.json({ ok: true, data: { items } });
});

// PATCH /api/feedback/:id
router.patch("/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const bodySchema = z
    .object({
      message: z
        .string()
        .min(5)
        .max(3000)
        .transform((s) => s.replace(/\s+/g, " ").trim())
        .optional(),
      status: z.enum(["new", "triaged", "closed"]).optional(),
    })
    .refine((v) => v.message || v.status, {
      message: "No changes provided",
    });

  const parsed = bodySchema.safeParse(req.body);
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

  const updated = await updateFeedback(req.params.id, parsed.data);
  if (!updated) {
    res
      .status(404)
      .json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Feedback not found",
        },
      });
    return;
  }

  res.json({ ok: true, data: { feedback: updated } });
});

// DELETE /api/feedback/:id
router.delete("/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const ok = await deleteFeedback(req.params.id);
  if (!ok) {
    res
      .status(404)
      .json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Feedback not found",
        },
      });
    return;
  }
  res.json({ ok: true });
});

export default router;