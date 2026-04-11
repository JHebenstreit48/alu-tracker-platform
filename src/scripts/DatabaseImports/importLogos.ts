import "dotenv/config";
import fs from "fs";
import path from "path";
import { adminBucket } from "@/Firebase/firebaseAdmin";
import { PUBLIC_DIR, logConfig } from "../../utils/scripts/carData/seedConfig";

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}

(async function main(): Promise<void> {
  console.log("🏁 Seeding logo images to Firebase Storage");
  logConfig(adminBucket.name);

  const root = path.join(PUBLIC_DIR, "images", "logos");
  if (!fs.existsSync(root)) {
    console.error("❌ No images/logos directory under public/");
    process.exit(1);
  }

  let uploaded = 0;
  let updated = 0;
  let skipped = 0;

  for (const filePath of walk(root)) {
    const rel = path
      .relative(PUBLIC_DIR, filePath)
      .replace(/\\/g, "/");

    const dest = rel;
    const fileRef = adminBucket.file(dest);
    const localSize = fs.statSync(filePath).size;

    const [exists] = await fileRef.exists();

    if (exists) {
      const [metadata] = await fileRef.getMetadata();
      const remoteSize = Number(metadata.size);

      if (remoteSize === localSize) {
        skipped++;
        continue;
      }

      // Size differs — re-upload
      await adminBucket.upload(filePath, {
        destination: dest,
        metadata: { cacheControl: "public, max-age=31536000" },
      });
      console.log(`🔄 Updated  ${dest} (${remoteSize}B → ${localSize}B)`);
      updated++;
    } else {
      await adminBucket.upload(filePath, {
        destination: dest,
        metadata: { cacheControl: "public, max-age=31536000" },
      });
      console.log(`📤 Uploaded ${dest}`);
      uploaded++;
    }
  }

  console.log(
    `✅ Done. Uploaded: ${uploaded}, updated: ${updated}, skipped: ${skipped}`
  );
  process.exit(0);
})().catch((err) => {
  console.error("❌ importLogos failed:", err);
  process.exit(1);
});