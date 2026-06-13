import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
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

function getArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : undefined;
}

function parseKeys(keysArg?: string): string[] {
  if (!keysArg) return [];
  return keysArg.split(",").map((s) => s.trim()).filter(Boolean);
}

function readKeysFile(filePath: string): string[] {
  const txt = fs.readFileSync(filePath, "utf8");
  return txt
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !s.startsWith("#"));
}

/**
 * Converts a normalizedKey like "bugatti_chiron_pur_sport"
 * into a filename stem like "chironpursport" by stripping the
 * brand prefix (first segment) and removing underscores.
 */
function normalizedKeyToStem(key: string): string {
  const parts = key.split("_");
  return parts.slice(1).join("").toLowerCase();
}

(async function main(): Promise<void> {
  const keysArg = getArg("keys") || process.env.SEED_KEYS;
  const fileArg = getArg("file") || process.env.SEED_KEYS_FILE;
  const forceFlag = process.argv.includes("--force");

  let keys: string[] = parseKeys(keysArg);
  if (!keys.length && fileArg) keys = readKeysFile(fileArg);

  if (!keys.length) {
    console.error(
      "❌ Provide keys via --keys=a,b,c OR --file=path.txt (or env SEED_KEYS / SEED_KEYS_FILE)"
    );
    process.exit(1);
  }

  console.log(`🖼️  Seeding SELECTED car images to Firebase Storage: ${keys.length} key(s)`);
  if (forceFlag) console.log("⚡ Force mode enabled — re-uploading regardless of changes");
  logConfig(adminBucket.name);

  // Build a lookup: stem → full local file path
  // e.g. "chironpursport" → "public/images/cars/B/Bugatti/chironpursport.webp"
  const root = path.join(PUBLIC_DIR, "images", "cars");
  if (!fs.existsSync(root)) {
    console.error("❌ No images/cars directory under public/");
    process.exit(1);
  }

  const stemToPath = new Map<string, string>();
  for (const filePath of walk(root)) {
    if (!filePath.endsWith(".webp")) continue;
    const stem = path.basename(filePath, ".webp").toLowerCase();
    stemToPath.set(stem, filePath);
  }

  let uploaded = 0;
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const key of keys) {
    const stem = normalizedKeyToStem(key);
    const filePath = stemToPath.get(stem);

    if (!filePath) {
      console.warn(`⚠️  No local .webp found for key "${key}" (looked for stem "${stem}")`);
      notFound++;
      continue;
    }

    const dest = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
    const fileRef = adminBucket.file(dest);
    const [exists] = await fileRef.exists();

    if (exists && !forceFlag) {
      const localBuffer = fs.readFileSync(filePath);
      const localMd5 = crypto.createHash("md5").update(localBuffer).digest("base64");
      const [metadata] = await fileRef.getMetadata();
      const remoteMd5 = metadata.md5Hash;

      if (localMd5 === remoteMd5) {
        console.log(`⏭️  No change: ${dest}`);
        skipped++;
        continue;
      }

      await fileRef.delete();
      await adminBucket.upload(filePath, { destination: dest });
      console.log(`♻️  Updated changed file: ${dest}`);
      updated++;
      continue;
    }

    if (exists && forceFlag) {
      await fileRef.delete();
    }

    await adminBucket.upload(filePath, { destination: dest });
    console.log(`📤 Uploaded: ${dest}`);
    uploaded++;
  }

  console.log(
    `✅ Done. Uploaded: ${uploaded}, updated: ${updated}, skipped: ${skipped}, not found: ${notFound}`
  );
  process.exit(0);
})().catch((err) => {
  console.error("❌ importCarImagesSelected failed:", err);
  process.exit(1);
});