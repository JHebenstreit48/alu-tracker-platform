import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import CarModel from "@/models/car/schema";
import CarDataStatus from "@/models/car/Statuses/dataStatus";
import { connectToDb } from "@/Utility/connection";

// Enable TS + alias imports at runtime for Class*.ts
require("ts-node/register/transpile-only");
require("tsconfig-paths/register");

const ROOT_DIR = path.resolve(__dirname, "../seeds/Brands");

type CarDoc = Record<string, any>;

const normalizeString = (s: string) =>
  s.normalize("NFD")
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
  // ClassA.json / ClassA.ts
  const m = base.match(/^class([a-z])\./i);
  if (m) {
    klass = m[1].toUpperCase();
  } else {
    // .../<Brand>/<ClassFolder>/<car>.json  → use folder name as class
    const folder = parts[i + 3];
    if (folder && /^[A-D]$/i.test(folder)) klass = folder.toUpperCase();
  }
  return { brand, klass };
}

const asArray = (x: any): CarDoc[] =>
  Array.isArray(x) ? x : x && typeof x === "object" ? [x] : [];

// ---- Loaders ----
async function loadCarsFromFile(file: string): Promise<CarDoc[]> {
  if (isJson(file)) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return asArray(raw).map((o) => (Array.isArray(o) ? o[0] : o));
  }
  if (isTsCollector(file)) {
    const mod = await import(path.resolve(file));
    const data = mod.default ?? mod.cars ?? [];
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
  console.log("🧪 Experimental import (upsert only; alias + TS collectors; detailed diff logging)");
  console.log("📁 Root:", ROOT_DIR);

  await connectToDb();

  // Ensure unique key (protect against true dupes)
  try {
    await CarModel.collection.createIndex({ normalizedKey: 1 }, { unique: true });
  } catch {}

  // 1) Discover all eligible files
  const allFiles = Array.from(walk(ROOT_DIR)).filter(
    (f) => isJson(f) || isTsCollector(f)
  );

  // 2) Build a map of brand/class → hasCollector
  const collectorSet = new Set<string>();
  for (const f of allFiles.filter(isTsCollector)) {
    const { brand, klass } = parseBrandAndClass(f);
    if (brand && klass) collectorSet.add(`${brand}::${klass}`);
  }

  // 3) Decide final file list:
  // - Keep all ClassX.ts (collectors)
  // - Keep ClassX.json only if there is NO ClassX.ts for that brand/class
  // - Skip per-car JSONs in <Brand>/<ClassFolder> if a collector for that class exists
  const files: string[] = [];
  for (const f of allFiles) {
    const { brand, klass } = parseBrandAndClass(f);
    if (!brand || !klass) {
      files.push(f); // things like Brand.json etc — still allowed
      continue;
    }
    const key = `${brand}::${klass}`;
    if (isTsCollector(f)) {
      files.push(f);
    } else if (isJson(f)) {
      const base = path.basename(f).toLowerCase();
      if (/^class[a-d]\.json$/.test(base)) {
        if (!collectorSet.has(key)) files.push(f); // no collector → use JSON
      } else {
        // per-car json inside class folder
        if (!collectorSet.has(key)) files.push(f); // only if no collector for this class
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
      const opKeys: string[] = []; // track keys by op index

      for (const car of docs) {
        // Normalize required fields
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

        // Identify which ops were *inserts* (upserts)
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
          console.log("   👉 If unexpected, fix Brand/Model in the source file so the normalizedKey matches your canonical one, then re-run. You can delete the stray by normalizedKey in Compass.");
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
  console.log(`📊 DB count: ${final} | Car ops: ${carOps} | Status ops: ${statusOps} | Newly inserted this run: ${totalInserted}`);

  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
})().catch(async (e) => {
  console.error("❌ Import failed:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});