import dotenv from "dotenv"; dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectToDb } from "@/Utility/connection";
import GarageLevelModel from "@/models/garageLevels";

// Allow TS collectors like GL1-10.ts at runtime (same trick as cars)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("ts-node/register/transpile-only");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("tsconfig-paths/register");
} catch {}

type Car = { brand: string; model: string; image: string };
type Level = { GarageLevelKey: number; xp: number; cars: Car[] };

const ROOT_DIR = path.resolve(__dirname, "../seeds/GarageLevels");
const LEGACY_FILE = path.join(ROOT_DIR, "GarageLevels.json");

// ---- file type helpers ----
// Collectors (preferred): either TS modules (e.g., GL1-10.ts, GL1-5.ts) that default-export an array,
// or JSON "chunk" files (e.g., GL1-10.json, GL1-5.json) that hold an array of levels.
const isCollectorTs = (f: string) => /[/\\]GL\d{1,2}-\d{1,2}\.ts$/i.test(f);
const isCollectorJson = (f: string) => /[/\\]GL\d{1,2}-\d{1,2}\.json$/i.test(f);
const isCollector = (f: string) => isCollectorTs(f) || isCollectorJson(f);

// Per-level JSON files like gl01.json, gl6.json, etc. (single level object)
const isPerLevelJson = (f: string) => /[/\\]gl\d{1,2}\.json$/i.test(f);

// Any JSON
const isJson = (f: string) => /\.json$/i.test(f);

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

// Parent folder helper: ".../GarageLevels/GL1-10/GL1-5.ts" -> "GL1-10"
function parentFolderName(p: string): string | undefined {
  const parts = p.split(path.sep);
  if (parts.length < 2) return undefined;
  return parts[parts.length - 2];
}

async function loadLevelsFrom(file: string): Promise<Level[]> {
  if (isJson(file)) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    // JSON collectors hold an array; per-level JSON is a single object
    return Array.isArray(raw) ? (raw as Level[]) : [raw as Level];
  }
  if (isCollectorTs(file)) {
    const mod = await import(path.resolve(file));
    const data: unknown = (mod as any).default ?? (mod as any).levels ?? [];
    return Array.isArray(data) ? (data as Level[]) : [];
  }
  return [];
}

// Same image-path enrichment you use elsewhere
function buildImagePath(brand: string, filename: string): string {
  const brandInitial = brand.charAt(0).toUpperCase();
  return `/images/cars/${brandInitial}/${brand}/${filename}`;
}

function enhance(levels: Level[]): Level[] {
  return levels.map((lvl) => ({
    GarageLevelKey: Number(lvl.GarageLevelKey),
    xp: Number(lvl.xp),
    cars: (lvl.cars || []).map((car) => ({
      brand: String(car.brand),
      model: String(car.model),
      image: buildImagePath(String(car.brand), String(car.image)),
    })),
  }));
}

(async function main() {
  console.log("🌱 Seeding garage levels (collectors preferred; JSON fallback; legacy last)");
  console.log("📁 Root:", ROOT_DIR);

  await connectToDb();

  // Unique index to keep things de-duped, just like cars
  try {
    await GarageLevelModel.collection.createIndex({ GarageLevelKey: 1 }, { unique: true });
  } catch {}

  const allFiles = Array.from(walk(ROOT_DIR));

  // Find collectors (TS or JSON chunk arrays)
  const collectors = allFiles.filter(isCollector);

  // Mark any parent folder containing at least one collector as "covered"
  // (so we ignore per-level JSON in that folder to avoid double ingest)
  const coveredParents = new Set<string>();
  for (const c of collectors) {
    const parent = parentFolderName(c);
    if (parent) coveredParents.add(parent);
  }

  // Build ingestion list:
  // 1) All collectors (can have multiple per folder, e.g., GL1-5.ts + GL6-10.ts)
  const filesToIngest: string[] = [...collectors];

  // 2) Per-level JSON only when no collector exists in that parent folder
  for (const f of allFiles.filter(isPerLevelJson)) {
    const parent = parentFolderName(f);
    if (!parent || !coveredParents.has(parent)) filesToIngest.push(f);
  }

  // 3) Legacy monolith only if nothing else found
  if (!filesToIngest.length && fs.existsSync(LEGACY_FILE)) {
    filesToIngest.push(LEGACY_FILE);
  }

  console.log(`📄 Eligible files after de-dupe: ${filesToIngest.length}`);

  // Mirror your safety behavior
  if (process.env.NODE_ENV !== "production") {
    await GarageLevelModel.deleteMany();
    console.log("🧼 Existing garage levels removed (non-prod).");
  } else {
    console.log("🛑 Skipping deleteMany() in production.");
  }

  let opsTotal = 0;
  let insertedTotal = 0;

  for (const file of filesToIngest) {
    try {
      const loaded = await loadLevelsFrom(file);
      const levels = enhance(loaded);
      if (!levels.length) {
        console.warn(`⚠️ Skipped empty/invalid: ${file}`);
        continue;
      }

      // Upsert by GarageLevelKey (idempotent, no DB bloat)
      const bulk = levels.map((lvl) => ({
        updateOne: {
          filter: { GarageLevelKey: lvl.GarageLevelKey },
          update: { $set: lvl },
          upsert: true,
        },
      }));

      const res = await GarageLevelModel.bulkWrite(bulk, { ordered: false });
      const insertedCount = Object.keys(res.upsertedIds || {}).length;
      const updatedCount = bulk.length - insertedCount;

      insertedTotal += insertedCount;
      opsTotal += bulk.length;

      console.log(
        `✅ ${path.relative(process.cwd(), file)} → updated: ${updatedCount}, inserted: ${insertedCount}`
      );
    } catch (e: any) {
      console.warn(`⚠️ Failed ${file}: ${e.message}`);
    }
  }

  const final = await GarageLevelModel.countDocuments();
  console.log(`📊 Levels total: ${final} | Ops: ${opsTotal} | Newly inserted: ${insertedTotal}`);

  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
})().catch(async (e) => {
  console.error("❌ Import failed:", e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});