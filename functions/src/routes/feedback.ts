import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { adminDb } from "../firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const router = Router();
const COLL = "feedback";

const createSchema = z.object({
  category: z.enum(["bug", "feature", "content", "other"]),
  message: z
    .string()
    .min(5)
    .max(3000)
    .transform((s: string) => s.replace(/\s+/g, " ").trim()),
  email: z.string().email().max(254).optional(),
  pageUrl: z.string().url().max(2000).optional(),
  hp: z.string().optional(),
});

type CreateBody = z.infer<typeof createSchema>;

type FeedbackCategory = "bug" | "feature" | "content" | "other";
type FeedbackStatus = "new" | "triaged" | "closed";

interface FeedbackDoc {
  category: FeedbackCategory;
  message: string;
  email?: string;
  pageUrl?: string;
  userAgent?: string;
  status: FeedbackStatus;
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

// POST /api/feedback
router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body as CreateBody);
    if (!parsed.success) {
      res.status(400).json(err("VALIDATION_ERROR", "Invalid input"));
      return;
    }

    const { hp, ...data } = parsed.data;
    if (hp && hp.trim() !== "") {
      // Honeypot – pretend success
      res.json(ok({}));
      return;
    }

    const now = FieldValue.serverTimestamp();

    const userAgent =
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : undefined;

    const toSave: Omit<FeedbackDoc, "createdAt" | "updatedAt"> & {
      createdAt: typeof now;
      updatedAt: typeof now;
    } = {
      ...data,
      userAgent,
      status: "new",
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection(COLL).add(toSave);

    res.json(ok({}));
  } catch (e) {
    console.error("[feedback] POST error", e);
    res.status(500).json(err("SERVER_ERROR", "Unexpected error"));
  }
});

// GET /api/feedback/public?mode=recent|all OR ?status=new,triaged
router.get("/public", async (req: Request, res: Response) => {
  try {
    const mode = (req.query.mode as string | undefined)?.trim();

    // Frontend uses mode=recent|all; map to statuses
    let statusParam = (req.query.status as string | undefined) ?? "triaged";

    if (mode === "all") {
      statusParam = "new,triaged,closed";
    } else if (mode === "recent") {
      statusParam = "new,triaged";
    }

    const allStatuses: FeedbackStatus[] = ["new", "triaged", "closed"];
    const requested = statusParam
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is FeedbackStatus => {
        return allStatuses.includes(s as FeedbackStatus);
      });

    const useStatuses =
      requested.length > 0 ? requested : (["triaged"] as FeedbackStatus[]);

    // Simple query (no composite index needed). Filter statuses in memory.
    const snap = await adminDb
      .collection(COLL)
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const items = snap.docs
      .map((doc) => {
        const fb = doc.data() as FeedbackDoc;
        return {
          _id: doc.id,
          category: fb.category,
          message: fb.message,
          pageUrl: fb.pageUrl,
          status: fb.status,
          createdAt: fb.createdAt.toDate().toISOString(),
        };
      })
      .filter((i) => useStatuses.includes(i.status))
      .slice(0, 100);

    res.json(ok({ items }));
  } catch (e) {
    console.error("[feedback] GET /public error", e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json(err("SERVER_ERROR", msg));
  }
});

export default router;