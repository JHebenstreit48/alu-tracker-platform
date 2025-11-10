import { adminDb } from "@/Firebase/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export type CommentType = "missing-data" | "correction" | "general";
export type CommentStatus = "visible" | "pending" | "hidden";

export interface CommentRecord {
  id: string;
  normalizedKey: string;
  brand?: string;
  model?: string;
  type: CommentType;
  body: string;
  authorName?: string;
  authorEmail?: string; // stored, never exposed publicly except admin
  authorId?: string;
  editKeyHash?: string;
  status: CommentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeedbackRecord {
  id: string;
  category: "bug" | "feature" | "content" | "other";
  message: string;
  email?: string;
  pageUrl?: string;
  userAgent?: string;
  status: "new" | "triaged" | "closed";
  createdAt?: Date;
  updatedAt?: Date;
}

const commentsCol = adminDb.collection("comments");
const feedbackCol = adminDb.collection("feedback");

function toDate(v: any | undefined): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  if (v instanceof Timestamp) return v.toDate();
  return undefined;
}

// ---- Comments helpers ----

export async function createComment(data: {
  normalizedKey: string;
  brand?: string;
  model?: string;
  type: CommentType;
  body: string;
  authorName?: string;
  authorEmail?: string;
  authorId?: string;
  editKeyHash: string;
  status: CommentStatus;
}): Promise<{ id: string; status: CommentStatus }> {
  const now = FieldValue.serverTimestamp();
  const ref = await commentsCol.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return { id: ref.id, status: data.status };
}

export async function getVisibleCommentsBySlug(
  slug: string,
  limit = 200
): Promise<CommentRecord[]> {
  const snap = await commentsCol
    .where("normalizedKey", "==", slug)
    .where("status", "==", "visible")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      normalizedKey: data.normalizedKey,
      brand: data.brand,
      model: data.model,
      type: data.type,
      body: data.body,
      authorName: data.authorName,
      status: data.status,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function getCommentWithSecret(
  id: string
): Promise<CommentRecord | null> {
  const snap = await commentsCol.doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    id: snap.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as CommentRecord;
}

export async function updateComment(
  id: string,
  patch: Partial<CommentRecord>
): Promise<boolean> {
  const ref = commentsCol.doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
  return true;
}

export async function deleteComment(id: string): Promise<boolean> {
  const ref = commentsCol.doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.delete();
  return true;
}

export async function adminListComments(opts: {
  status?: CommentStatus;
  slug?: string;
  limit: number;
}): Promise<CommentRecord[]> {
  const { status, slug, limit } = opts;
  let q: FirebaseFirestore.Query = commentsCol;

  if (status) q = q.where("status", "==", status);
  if (slug) q = q.where("normalizedKey", "==", slug);

  q = q.orderBy("createdAt", "desc").limit(limit);

  const snap = await q.get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as CommentRecord;
  });
}

export async function claimCommentsByEmail(
  email: string,
  userId: string
): Promise<{ matched: number; modified: number }> {
  const snap = await commentsCol
    .where("authorEmail", "==", email)
    .where("authorId", "==", null)
    .get();

  if (snap.empty) return { matched: 0, modified: 0 };

  let modified = 0;
  const batch = adminDb.batch();

  snap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      authorId: userId,
      updatedAt: FieldValue.serverTimestamp(),
    });
    modified++;
  });

  await batch.commit();
  return { matched: snap.size, modified };
}

// ---- Feedback helpers ----

export async function createFeedback(data: {
  category: FeedbackRecord["category"];
  message: string;
  email?: string;
  pageUrl?: string;
  userAgent?: string;
}): Promise<void> {
  const now = FieldValue.serverTimestamp();
  await feedbackCol.add({
    ...data,
    status: "new",
    createdAt: now,
    updatedAt: now,
  });
}

export async function listPublicFeedback(opts: {
  statuses: FeedbackRecord["status"][];
  limit: number;
}): Promise<FeedbackRecord[]> {
  const { statuses, limit } = opts;

  const snap = await feedbackCol
    .where("status", "in", statuses)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      category: data.category,
      message: data.message,
      pageUrl: data.pageUrl,
      status: data.status,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as FeedbackRecord;
  });
}

export async function adminListFeedback(opts: {
  status?: FeedbackRecord["status"] | "all";
  limit: number;
}): Promise<FeedbackRecord[]> {
  const { status, limit } = opts;
  let q: FirebaseFirestore.Query = feedbackCol;

  if (status && status !== "all") {
    q = q.where("status", "==", status);
  }

  q = q.orderBy("createdAt", "desc").limit(limit);

  const snap = await q.get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as FeedbackRecord;
  });
}

export async function updateFeedback(
  id: string,
  patch: Partial<Pick<FeedbackRecord, "message" | "status">>
): Promise<FeedbackRecord | null> {
  const ref = feedbackCol.doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;

  await ref.update({
    ...patch,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  const data = updated.data()!;
  return {
    id: updated.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as FeedbackRecord;
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const ref = feedbackCol.doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.delete();
  return true;
}