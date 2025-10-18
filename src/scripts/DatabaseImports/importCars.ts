// src/scripts/DatabaseImports/importCars.ts

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import CarModel from "@/models/car/schema";
import CarDataStatus from "@/models/car/Statuses/dataStatus";
import { connectToDb } from "@/Utility/connection";

try {
  require("ts-node/register/transpile-only");
  require("tsconfig-paths/register");
} catch {}

const ROOT_DIR = path.resolve(__dirname, "../../seeds/Brands");

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

function parseBrandAndClass(file: string): { brand?: string; klass?: string } {
  const parts = file.split(path.sep);
  const i = parts.lastIndexOf("Brands");
  if (i < 0) return {};
  const brand = parts[i + 2];
  let klass: string | undefined;

  const base = path.basename(file).toLowerCase();
  const m = base.match(/^class([a-z])\./i);
  if (m) klass = m[1].toUpperCase();
  else {
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
  console.log(
    "🌱 Seeding cars (unified): TS collectors + JSON, with de-dup + status upserts"
  );
  console.log(
    "📁 Root:",
    ROOT_DIR,
    "exists:",
    fs.existsSync(ROOT_DIR)
  );

  await connectToDb();
  console.log("✅ Connected to MongoDB.");

  try {
    await CarModel.collection.createIndex({ normalizedKey: 1 }, { unique: true });
  } catch {}

  const allFiles = Array.from(walk(ROOT_DIR)).filter(
    (f) => isJson(f) || isTsCollector(f)
  );

  const collectorSet = new Set<string>();
  for (const f of allFiles.filter(isTsCollector)) {
    const { brand, klass } = parseBrandAndClass(f);
    if (brand && klass) collectorSet.add(`${brand}::${klass}`);
  }

  const includeClassJsonWithCollector =
    process.env.INCLUDE_CLASS_JSON_WITH_COLLECTOR === "1";
  const includePerCarWithCollector =
    process.env.INCLUDE_PER_CAR_WITH_COLLECTOR === "1";

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
        if (!collectorSet.has(key) || includeClassJsonWithCollector) files.push(f);
      } else {
        if (!collectorSet.has(key) || includePerCarWithCollector) files.push(f);
      }
    }
  }

  console.log(`📄 Eligible files after de-dupe: ${files.length}`);

  // ---- PASS 1: read all docs and bucket by brand ----
  const brandBuckets = new Map<
    string,
    { docs: CarDoc[]; statusOps: any[]; keys: Set<string> }
  >();
  let expectedFromSeeds = 0;

  for (const file of files) {
    try {
      const docs = await loadCarsFromFile(file);
      console.log(`📦 ${path.relative(process.cwd(), file)} → docs: ${docs.length}`);
      if (!docs.length) {
        console.warn(`⚠️ Skipped empty/invalid: ${file}`);
        continue;
      }

      for (const car of docs) {
        const Brand = car.Brand ?? "";
        const Model = car.Model ?? "";
        const normalizedKey =
          (car.normalizedKey && String(car.normalizedKey).trim()) ||
          (Brand && Model ? generateCarKey(Brand, Model) : undefined);

        if (!normalizedKey || !Brand) {
          console.warn(
            `⚠️ Missing Brand/Model/normalizedKey in ${file}; skipping one entry.`
          );
          continue;
        }

        const bucket =
          brandBuckets.get(Brand) ||
          { docs: [], statusOps: [], keys: new Set<string>() };
        const doc = { ...car, Brand, Model, normalizedKey };

        bucket.docs.push(doc);
        bucket.keys.add(normalizedKey);

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
          bucket.statusOps.push({
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

        brandBuckets.set(Brand, bucket);
        expectedFromSeeds += 1;
      }
    } catch (e: any) {
      console.warn(`⚠️ Failed ${file}: ${e?.message}`);
    }
  }

  // ---- PASS 2: per-brand prune + upsert ----
  let carOps = 0;
  let statusOps = 0;
  let totalInserted = 0;

  for (const [brand, bucket] of brandBuckets.entries()) {
    const newKeys = Array.from(bucket.keys);
    const pruneFilter = { Brand: brand, normalizedKey: { $nin: newKeys } };
    const toDelete = await CarModel.countDocuments(pruneFilter);
    if (toDelete > 0) {
      const delRes = await CarModel.deleteMany(pruneFilter);
      console.log(`🧹 ${brand}: pruned ${delRes.deletedCount} stale row(s).`);
    }

    const bulk: any[] = [];
    const opKeys: string[] = [];

    for (const doc of bucket.docs) {
      bulk.push({
        updateOne: {
          filter: { normalizedKey: doc.normalizedKey },
          update: { $set: doc },
          upsert: true,
        },
      });
      opKeys.push(doc.normalizedKey);
    }

    if (bulk.length) {
      const res = await CarModel.bulkWrite(bulk, { ordered: false });
      const upsertedIdx = Object.keys(res.upsertedIds || {}).map(Number);
      const insertedKeys = upsertedIdx.map((i) => opKeys[i]);
      const insertedCount = upsertedIdx.length;
      const updatedCount = bulk.length - insertedCount;
      totalInserted += insertedCount;
      carOps += bulk.length;

      console.log(
        `✅ ${brand} → updated: ${updatedCount}, inserted: ${insertedCount}`
      );
      if (insertedKeys.length) {
        console.log(`   🆕 inserted normalizedKey(s): ${insertedKeys.join(", ")}`);
      }
    }

    if (bucket.statusOps.length) {
      const res2 = await CarDataStatus.bulkWrite(bucket.statusOps, { ordered: false });
      const insertedStatuses = Object.keys(res2.upsertedIds || {}).length;
      const updatedStatuses = bucket.statusOps.length - insertedStatuses;
      console.log(
        `🛈 ${brand} (status) → updated: ${updatedStatuses}, inserted: ${insertedStatuses}`
      );
      statusOps += bucket.statusOps.length;
    }
  }

  const final = await CarModel.countDocuments();
  console.log(`🧮 Expected from seeds (this run): ${expectedFromSeeds}`);
  console.log(
    `📊 DB total: ${final} | Car ops: ${carOps} | Status ops: ${statusOps} | Newly inserted: ${totalInserted}`
  );

  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
})().catch(async (e) => {
  console.error("❌ Import failed:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});