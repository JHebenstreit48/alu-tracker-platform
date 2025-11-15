import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { adminDb } from "../firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const router = Router();
const COLL = "comments";

const AUTO_VISIBLE = process.env.COMMENTS_AUTO_VISIBLE === "true";

const createSchema = z.object({
  normalizedKey: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(120).optional(),
  model: z.string().trim().max(120).optional(),
  type: z.enum(["missing-data", "correction", "general"]),
  body: z
    .string()
    .min(5)
    .max(2000)
    .transform((s: string) => s.replace(/\s+/g, " ").trim()),
  authorName: z.string().trim().max(120).optional(),
  authorEmail: z.string().trim().max(254).email().optional(),
  hp: z.string().optional(), // honeypot
});

type CreateBody = z.infer<typeof createSchema>;

type CommentStatus = "visible" | "pending" | "hidden";

interface CommentDoc {
  normalizedKey: string;
  brand?: string;
  model?: string;
  type: "missing-data" | "correction" | "general";
  body: string;
  authorName?: string;
  authorEmail?: string;
  status: CommentStatus;
  editKeyHash?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ErrorPayload {
  code: string;
  message: string;
}

interface ApiOk<T> {
  ok: true;
  data: T;
}

interface ApiErr {
  ok: false;
  error: ErrorPayload;
}

function ok<T>(data: T): ApiOk<T> {
  return { ok: true, data };
}

function err(code: string, message: string): ApiErr {
  return { ok: false, error: { code, message } };
}

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

// GET /api/comments/:slug
router.get("/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params.slug || "").trim();
  if (!slug) {
    res.status(400).json(err("BAD_REQUEST", "Missing slug"));
    return;
  }

  try {
    const snap = await adminDb
      .collection(COLL)
      .where("normalizedKey", "==", slug)
      .where("status", "==", "visible")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const comments = snap.docs.map((doc) => {
      const c = doc.data() as CommentDoc;
      return {
        _id: doc.id,
        normalizedKey: c.normalizedKey,
        brand: c.brand,
        model: c.model,
        type: c.type,
        body: c.body,
        authorName: c.authorName,
        status: c.status,
        createdAt: c.createdAt.toDate().toISOString(),
        updatedAt: c.updatedAt.toDate().toISOString(),
      };
    });

    res.json(ok({ comments }));
  } catch (e) {
    console.error("[comments] GET error", e);
    res.status(500).json(err("SERVER_ERROR", "Unexpected error"));
  }
});

// POST /api/comments
router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body as CreateBody);
    if (!parsed.success) {
      res.status(400).json(err("VALIDATION_ERROR", "Invalid input"));
      return;
    }

    const { hp, ...data } = parsed.data;
    if (hp && hp.trim() !== "") {
      // Honeypot: pretend success
      res.json(ok({}));
      return;
    }

    const editKey = crypto.randomBytes(24).toString("hex");
    const now = FieldValue.serverTimestamp();

    const toSave: Omit<CommentDoc, "createdAt" | "updatedAt"> & {
      createdAt: typeof now;
      updatedAt: typeof now;
    } = {
      ...data,
      status: AUTO_VISIBLE ? "visible" : "pending",
      editKeyHash: sha256Hex(editKey),
      createdAt: now,
      updatedAt: now,
    };

    const ref = await adminDb.collection(COLL).add(toSave);

    res.json(
      ok({
        id: ref.id,
        status: toSave.status,
        editKey,
      })
    );
  } catch (e) {
    console.error("[comments] POST error", e);
    res.status(500).json(err("SERVER_ERROR", "Unexpected error"));
  }
});

export default router;