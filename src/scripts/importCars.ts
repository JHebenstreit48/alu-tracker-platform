import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import CarModel from "@/models/car/schema";
import CarDataStatus from "@/models/car/Statuses/dataStatus";
import { connectToDb } from "@/Utility/connection";

// Allow importing TS collectors like ClassA.ts at runtime
// (ts-node/register might already be injected by CLI; this is idempotent)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("ts-node/register/transpile-only");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("tsconfig-paths/register");
} catch {}

/**
 * Root folder that contains Brands/<Letter>/<Brand>/(ClassX.ts|ClassX.json|<ClassFolder>/*.json)
 * Adjust if your layout differs.
 */
const ROOT_DIR = path.resolve(__dirname, "../seeds/Brands");

type CarDoc = Record<string, any>;

const normalizeString = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const generateCarKey = (brand: string, model: string) =>
  normalizeString(`${brand}_${model}`);

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

const isJson = (f: string) => /\.json$/i.test(f);
const isTsCollector = (f: string) => /[/\\]Class[A-Z]\.ts$/i.test(f);

// ---- Helpers to map files to (brand, class) so we can prefer collectors ----
function parseBrandAndClass(file: string): { brand?: string; klass?: string } {
  const parts = file.split(path.sep);
  const i = parts.lastIndexOf("Brands");
  if (i < 0) return {};
  // layout: .../Brands/<Letter>/<Brand>/(ClassX.* | <ClassFolder>/file.json)
  const brand = parts[i + 2];
  let klass: string | undefined;

  const base = path.basename(file).toLowerCase();
  const m = base.match(/^class([a-z])\./i); // ClassA.ts / ClassA.json
  if (m) {
    klass = m[1].toUpperCase();
  } else {
    // .../<Brand>/<ClassFolder>/<car>.json → use folder name as class
    const folder = parts[i + 3];
    if (folder && /^[A-D|S]$/i.test(folder)) klass = folder.toUpperCase();
  }
  return { brand, klass };
}

const asArray = (x: any): CarDoc[] =>
  Array.isArray(x) ? x : x && typeof x === "object" ? [x] : [];

async function loadCarsFromFile(file: string): Promise<CarDoc[]> {
  if (isJson(file)) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return asArray(raw).map((o) => (Array.isArray(o) ? o[0] : o));
  }
  if (isTsCollector(file)) {
    const mod = await import(path.resolve(file));
    const data = (mod as any).default ?? (mod as any).cars ?? [];
    return asArray(data).map((o) => (Array.isArray(o) ? o[0] : o));
  }
  return [];
}

// Sanitize status values
const cleanStatus = (
  raw: any
): "complete" | "in progress" | "missing" | "unknown" => {
  if (raw == null) return "unknown";
  const s = String(raw).toLowerCase().replace(/_/g, " ").trim();
  return (["complete", "in progress", "missing", "unknown"] as const).includes(
    s as any
  )
    ? (s as any)
    : "unknown";
};

(async function main() {
  console.log("🌱 Seeding cars (unified): TS collectors + JSON, with de-dup + status upserts");
  console.log("📁 Root:", ROOT_DIR);

  await connectToDb();

  // Ensure unique index on normalizedKey so we don't create true dupes
  try {
    await CarModel.collection.createIndex({ normalizedKey: 1 }, { unique: true });
  } catch {}

  // 1) Discover all candidate files
  const allFiles = Array.from(walk(ROOT_DIR)).filter(
    (f) => isJson(f) || isTsCollector(f)
  );

  // 2) Build a set of brand/class combos that have a TS collector (preferred)
  const collectorSet = new Set<string>();
  for (const f of allFiles.filter(isTsCollector)) {
    const { brand, klass } = parseBrandAndClass(f);
    if (brand && klass) collectorSet.add(`${brand}::${klass}`);
  }

  // 3) Decide the final list:
  //    - Always include ClassX.ts (collector) for that brand/class
  //    - Include ClassX.json only if there is NO ClassX.ts for that brand/class
  //    - Include per-car JSON inside class folders only if there is NO collector for that class
  //    - Include any other JSON (e.g., Brand.json) as-is
  const files: string[] = [];
  for (const f of allFiles) {
    const { brand, klass } = parseBrandAndClass(f);

    if (!brand || !klass) {
      files.push(f);
      continue;
    }

    const key = `${brand}::${klass}`;
    if (isTsCollector(f)) {
      files.push(f);
      continue;
    }

    if (isJson(f)) {
      const base = path.basename(f).toLowerCase();
      if (/^class[a-z]\.json$/.test(base)) {
        if (!collectorSet.has(key)) files.push(f);
      } else {
        // per-car jsons inside class folder
        if (!collectorSet.has(key)) files.push(f);
      }
    }
  }

  console.log(`📄 Eligible files after de-dupe: ${files.length}`);

  let carOps = 0;
  let statusOps = 0;
  let totalInserted = 0;

  for (const file of files) {
    try {
      const docs = await loadCarsFromFile(file);
      if (!docs.length) {
        console.warn(`⚠️ Skipped empty/invalid: ${file}`);
        continue;
      }

      const bulk: any[] = [];
      const statusBulk: any[] = [];
      const opKeys: string[] = [];

      for (const car of docs) {
        const Brand = car.Brand ?? "";
        const Model = car.Model ?? "";
        const normalizedKey =
          (car.normalizedKey && String(car.normalizedKey).trim()) ||
          (Brand && Model ? generateCarKey(Brand, Model) : undefined);

        if (!normalizedKey) {
          console.warn(
            `⚠️ Missing Brand/Model/normalizedKey in ${file}; skipping one entry.`
          );
          continue;
        }

        const doc = { ...car, Brand, Model, normalizedKey };

        bulk.push({
          updateOne: {
            filter: { normalizedKey },
            update: { $set: doc },
            upsert: true,
          },
        });
        opKeys.push(normalizedKey);

        if (
          car.status !== undefined ||
          car.message !== undefined ||
          car.sources !== undefined
        ) {
          const sources = Array.isArray(car.sources)
            ? car.sources
            : car.sources
            ? [String(car.sources)]
            : [];
          statusBulk.push({
            updateOne: {
              filter: { normalizedKey },
              update: {
                $set: {
                  Brand,
                  Model,
                  normalizedKey,
                  status: cleanStatus(car.status),
                  message: car.message ?? "",
                  sources,
                },
              },
              upsert: true,
            },
          });
        }
      }

      if (bulk.length) {
        const res = await CarModel.bulkWrite(bulk, { ordered: false });

        const upsertedIdx = Object.keys(res.upsertedIds || {}).map(Number);
        const insertedKeys = upsertedIdx.map((i) => opKeys[i]);
        const insertedCount = upsertedIdx.length;
        const updatedCount = bulk.length - insertedCount;
        totalInserted += insertedCount;

        console.log(
          `✅ ${path.relative(process.cwd(), file)} → updated: ${updatedCount}, inserted: ${insertedCount}`
        );
        if (insertedKeys.length) {
          console.log(`   🆕 inserted normalizedKey(s): ${insertedKeys.join(", ")}`);
        }

        carOps += bulk.length;
      }

      if (statusBulk.length) {
        const res2 = await CarDataStatus.bulkWrite(statusBulk, { ordered: false });
        const insertedStatuses = Object.keys(res2.upsertedIds || {}).length;
        const updatedStatuses = statusBulk.length - insertedStatuses;
        console.log(
          `🛈 ${path.relative(process.cwd(), file)} (status) → updated: ${updatedStatuses}, inserted: ${insertedStatuses}`
        );
        statusOps += statusBulk.length;
      }
    } catch (e: any) {
      console.warn(`⚠️ Failed ${file}: ${e.message}`);
    }
  }

  const final = await CarModel.countDocuments();
  console.log(
    `📊 DB total: ${final} | Car ops: ${carOps} | Status ops: ${statusOps} | Newly inserted: ${totalInserted}`
  );

  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
})().catch(async (e) => {
  console.error("❌ Import failed:", e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});