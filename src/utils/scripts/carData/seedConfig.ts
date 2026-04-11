import path from "path";
import fs from "fs";

export const ROOT_DIR = path.resolve(process.cwd(), "src/seeds/cars");
export const PUBLIC_DIR = path.resolve(process.cwd(), "public");

export const USE_FIREBASE_STORAGE_IMAGES =
  process.env.USE_FIREBASE_STORAGE_IMAGES === "1";

export const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "";

export const logConfig = (bucketName?: string): void => {
  console.log("📁 ROOT_DIR:", ROOT_DIR, "exists:", fs.existsSync(ROOT_DIR));
  console.log("📁 PUBLIC_DIR:", PUBLIC_DIR, "exists:", fs.existsSync(PUBLIC_DIR));
  console.log(
    "🪣 Use Storage:",
    USE_FIREBASE_STORAGE_IMAGES,
    "Bucket:",
    bucketName || "(n/a)"
  );
  console.log("🌐 IMAGE_BASE_URL:", IMAGE_BASE_URL || "(none)");
};