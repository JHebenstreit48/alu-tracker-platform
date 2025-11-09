import "dotenv/config";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.FB_TRACKER_PROJECT_ID;
const clientEmail = process.env.FB_TRACKER_CLIENT_EMAIL;
const rawKey = process.env.FB_TRACKER_PRIVATE_KEY;
const storageBucket = process.env.FB_TRACKER_STORAGE_BUCKET; // <- important

if (!projectId || !clientEmail || !rawKey) {
  throw new Error("Missing Firebase Admin env vars (FB_TRACKER_*)");
}

if (!storageBucket) {
  throw new Error("Missing FB_TRACKER_STORAGE_BUCKET (your gs:// bucket name without the gs://)");
}

const privateKey = rawKey.replace(/\\n/g, "\n");

const app =
  getApps()[0] ||
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket, // uses the exact bucket you configured
  });

export const adminDb = getFirestore(app);
export const adminBucket = getStorage(app).bucket();