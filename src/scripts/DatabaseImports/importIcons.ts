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
  console.log("⭐ Seeding icon images to Firebase Storage");
  logConfig(adminBucket.name);

  const root = path.join(PUBLIC_DIR, "images", "icons");
  if (!fs.existsSync(root)) {
    console.error("❌ No images/icons directory under public/");
    process.exit(1);
  }

  let uploaded = 0;
  let skipped = 0;

  for (const filePath of walk(root)) {
    const rel = path
      .relative(PUBLIC_DIR, filePath)
      .replace(/\\/g, "/"); // e.g. images/icons/star.png

    const dest = rel; // keep same structure in bucket

    const fileRef = adminBucket.file(dest);
    const [exists] = await fileRef.exists();

    if (exists) {
      skipped++;
      continue;
    }

    await adminBucket.upload(filePath, { destination: dest });
    console.log(`📤 Uploaded ${dest}`);
    uploaded++;
  }

  console.log(
    `✅ Done (icons). Uploaded: ${uploaded}, skipped existing: ${skipped}`
  );
  process.exit(0);
})().catch((err) => {
  console.error("❌ importIcons failed:", err);
  process.exit(1);
});