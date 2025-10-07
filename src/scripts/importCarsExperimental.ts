import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import CarModel from "@/models/car/schema";
import CarDataStatus from "@/models/car/dataStatus";
import { connectToDb } from "@/Utility/connection";

// Allow runtime TS + alias imports (for Class*.ts)
require("ts-node/register/transpile-only");
require("tsconfig-paths/register");

const ROOT_DIR = path.resolve(__dirname, "../seeds/Brands");

type CarDoc = Record<string, any>;

const normalizeString = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
   .replace(/\./g, "").replace(/-/g, "_").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
const generateCarKey = (brand: string, model: string) => normalizeString(`${brand}_${model}`);

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

const isJson = (f: string) => /\.json$/i.test(f);
const isTsCollector = (f: string) => /[/\\]Class[^/\\]*\.ts$/i.test(f);

// Compute a “collector key” (brand + class) from a path
function collectorKeyFromPath(file: string): string | null {
  const parts = file.split(path.sep);
  const i = parts.lastIndexOf("Brands");
  // .../Brands/<Letter>/<Brand>/(ClassX.ts | ClassX.json)
  const brand = parts[i + 2];
  const base = path.basename(file).toLowerCase(); // classa.ts or classa.json
  const m = base.match(/^class([a-z])\./i);
  const klass = m ? m[1].toUpperCase() : null;
  if (!brand || !klass) return null;
  return `${brand}::${klass}`;
}

const cleanStatus = (raw: any): "complete" | "in progress" | "missing" | "unknown" => {
  if (raw == null) return "unknown";
  const s = String(raw).toLowerCase().replace(/_/g, " ").trim();
  return (["complete", "in progress", "missing", "unknown"] as const).includes(s as any)
    ? (s as any) : "unknown";
};

const asArray = (x: any): CarDoc[] => Array.isArray(x) ? x : x && typeof x === "object" ? [x] : [];

async function loadCarsFromFile(file: string): Promise<CarDoc[]> {
  if (isJson(file)) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return asArray(raw).map((o) => Array.isArray(o) ? o[0] : o);
  }
  if (isTsCollector(file)) {
    const mod = await import(path.resolve(file));
    const data = mod.default ?? mod.cars ?? [];
    return asArray(data).map((o) => Array.isArray(o) ? o[0] : o);
  }
  return [];
}

(async function main() {
  console.log("🧪 Experimental import (upsert only; alias + TS collectors)");
  console.log("📁 Root:", ROOT_DIR);
  await connectToDb();
  await CarModel.collection.createIndex({ normalizedKey: 1 }, { unique: true });

  const allFiles = Array.from(walk(ROOT_DIR)).filter(f => isJson(f) || isTsCollector(f));

  // Prefer TS collector over JSON if both exist for same brand/class
  const tsKeys = new Set(allFiles.filter(isTsCollector)
    .map(collectorKeyFromPath).filter(Boolean) as string[]);
  const files = allFiles.filter(f => {
    if (isJson(f)) {
      const key = collectorKeyFromPath(f);
      if (key && tsKeys.has(key)) return false; // skip ClassX.json if ClassX.ts exists
    }
    return true;
  });

  console.log(`📄 Eligible files: ${files.length}`);

  let carOps = 0, statusOps = 0;

  for (const file of files) {
    try {
      const docs = await loadCarsFromFile(file);
      if (!docs.length) { console.warn(`⚠️ Skipped empty/invalid: ${file}`); continue; }

      const bulk: any[] = [];
      const statusBulk: any[] = [];

      for (const car of docs) {
        const Brand = car.Brand ?? "";
        const Model = car.Model ?? "";
        const normalizedKey =
          (car.normalizedKey && String(car.normalizedKey).trim())
          || (Brand && Model ? generateCarKey(Brand, Model) : undefined);

        if (!normalizedKey) { console.warn(`⚠️ Missing Brand/Model/normalizedKey in ${file}`); continue; }

        const doc = { ...car, Brand, Model, normalizedKey };

        bulk.push({ updateOne: { filter: { normalizedKey }, update: { $set: doc }, upsert: true } });

        if (car.status !== undefined || car.message !== undefined || car.sources !== undefined) {
          const sources = Array.isArray(car.sources) ? car.sources : car.sources ? [String(car.sources)] : [];
          statusBulk.push({
            updateOne: {
              filter: { normalizedKey },
              update: { $set: { Brand, Model, normalizedKey, status: cleanStatus(car.status), message: car.message ?? "", sources } },
              upsert: true
            }
          });
        }
      }

      if (bulk.length) {
        await CarModel.bulkWrite(bulk, { ordered: false });
        carOps += bulk.length;
        console.log(`✅ Upserted ${bulk.length} car(s) from ${path.relative(process.cwd(), file)}`);
      }
      if (statusBulk.length) {
        await CarDataStatus.bulkWrite(statusBulk, { ordered: false });
        statusOps += statusBulk.length;
        console.log(`🛈 Upserted ${statusBulk.length} status record(s) from ${path.relative(process.cwd(), file)}`);
      }
    } catch (e: any) {
      console.warn(`⚠️ Failed ${file}: ${e.message}`);
    }
  }

  const final = await CarModel.countDocuments();
  console.log(`📊 DB count: ${final} | Car ops: ${carOps} | Status ops: ${statusOps}`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
})().catch(async e => { console.error("❌ Import failed:", e); try { await mongoose.disconnect(); } catch {} process.exit(1); });
