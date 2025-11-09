// src/scripts/DatabaseImports/Firebase/seedImages.ts

import fs from "fs";
import path from "path";
import {
  PUBLIC_DIR,
  USE_FIREBASE_STORAGE_IMAGES,
  IMAGE_BASE_URL,
} from "./seedConfig";
import { adminBucket } from "@/Firebase/firebaseAdmin";

export async function resolveImagePath(
  rel: string | undefined
): Promise<string | undefined> {
  if (!rel) return undefined;

  // Normalize to /images/... format
  const withSlash = rel.startsWith("/") ? rel : `/${rel}`;
  const clean = withSlash.replace(/^\/+/, ""); // for fs/bucket paths

  // Option A: Use Firebase Storage (Blaze w/ bucket)
  if (USE_FIREBASE_STORAGE_IMAGES) {
    const localPath = path.join(PUBLIC_DIR, clean);

    if (!fs.existsSync(localPath)) {
      console.warn(
        `⚠️ Missing local image for ${withSlash} (looked in ${localPath})`
      );
      // Keep something usable so FE can still attempt to load it
      return withSlash;
    }

    const fileRef = adminBucket.file(clean);
    const [exists] = await fileRef.exists();

    if (!exists) {
      // ✅ upload is on the bucket, not the File
      await adminBucket.upload(localPath, { destination: clean });
      console.log(`📷 Uploaded ${clean} to Firebase Storage`);
    }

    // Store relative path; FE or helper can expand to full URL
    return `/${clean}`;
  }

  // Option B: No Storage, use external base URL (e.g. Render / CDN)
  if (IMAGE_BASE_URL) {
    return `${IMAGE_BASE_URL}${withSlash}`;
  }

  // Option C: fallback – keep relative path for static hosting
  return withSlash;
}