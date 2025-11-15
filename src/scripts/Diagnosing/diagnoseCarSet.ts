// import "dotenv/config";
// import fs from "fs";
// import path from "path";
// import mongoose from "mongoose";
// import CarModel from "@/models/car/schema";
// import { connectToDb } from "@/Utility/connection";

// // allow importing Class*.ts and alias paths
// require("ts-node/register/transpile-only");
// require("tsconfig-paths/register");

// const ROOT_DIR = path.resolve(__dirname, "../seeds/Brands");

// type CarDoc = Record<string, any>;

// const normalizeString = (s: string) =>
//   s.normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .toLowerCase()
//     .replace(/\./g, "")
//     .replace(/-/g, "_")
//     .replace(/\s+/g, "_")
//     .replace(/[^a-z0-9_]/g, "");

// const generateCarKey = (brand: string, model: string) =>
//   normalizeString(`${brand}_${model}`);

// function* walk(dir: string): Generator<string> {
//   if (!fs.existsSync(dir)) return;
//   for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
//     const p = path.join(dir, e.name);
//     if (e.isDirectory()) yield* walk(p);
//     else if (e.isFile()) yield p;
//   }
// }

// const isJson = (f: string) => /\.json$/i.test(f);
// const isTsCollector = (f: string) => /[/\\]Class[A-Z]\.ts$/i.test(f);

// function parseBrandAndClass(file: string): { brand?: string; klass?: string } {
//   const parts = file.split(path.sep);
//   const i = parts.lastIndexOf("Brands");
//   if (i < 0) return {};
//   const brand = parts[i + 2];
//   let klass: string | undefined;
//   const base = path.basename(file).toLowerCase();
//   const m = base.match(/^class([a-z])\./i);
//   if (m) {
//     klass = m[1].toUpperCase();
//   } else {
//     const folder = parts[i + 3];
//     if (folder && /^[A-D]$/i.test(folder)) klass = folder.toUpperCase();
//   }
//   return { brand, klass };
// }

// const asArray = (x: any): CarDoc[] =>
//   Array.isArray(x) ? x : x && typeof x === "object" ? [x] : [];

// async function loadCarsFromFile(file: string): Promise<CarDoc[]> {
//   if (isJson(file)) {
//     const raw = JSON.parse(fs.readFileSync(file, "utf8"));
//     return asArray(raw).map((o) => (Array.isArray(o) ? o[0] : o));
//   }
//   if (isTsCollector(file)) {
//     const mod = await import(path.resolve(file));
//     const data = mod.default ?? mod.cars ?? [];
//     return asArray(data).map((o) => (Array.isArray(o) ? o[0] : o));
//   }
//   return [];
// }

// (async function main() {
//   console.log("🔎 Diagnosing car set diff (DB vs sources, alias+collectors aware) …");
//   await connectToDb();

//   // Build list of eligible files with de-dupe rules (prefer ClassX.ts)
//   const all = Array.from(walk(ROOT_DIR)).filter((f) => isJson(f) || isTsCollector(f));
//   const collectorSet = new Set<string>();
//   for (const f of all.filter(isTsCollector)) {
//     const pc = parseBrandAndClass(f);
//     if (pc.brand && pc.klass) collectorSet.add(`${pc.brand}::${pc.klass}`);
//   }

//   const files: string[] = [];
//   for (const f of all) {
//     const pc = parseBrandAndClass(f);
//     if (!pc.brand || !pc.klass) {
//       files.push(f);
//       continue;
//     }
//     const key = `${pc.brand}::${pc.klass}`;
//     if (isTsCollector(f)) {
//       files.push(f);
//     } else if (isJson(f)) {
//       const base = path.basename(f).toLowerCase();
//       if (/^class[a-d]\.json$/.test(base)) {
//         if (!collectorSet.has(key)) files.push(f);
//       } else {
//         if (!collectorSet.has(key)) files.push(f);
//       }
//     }
//   }

//   // Collect expected keys from sources
//   const expectedKeys = new Set<string>();
//   for (const f of files) {
//     try {
//       const docs = await loadCarsFromFile(f);
//       for (const car of docs) {
//         const Brand = car.Brand ?? "";
//         const Model = car.Model ?? "";
//         const key =
//           (car.normalizedKey && String(car.normalizedKey).trim()) ||
//           (Brand && Model ? generateCarKey(Brand, Model) : "");
//         if (!key) continue;
//         expectedKeys.add(key);
//       }
//     } catch (e: any) {
//       console.warn(`⚠️ Failed reading ${f}: ${e.message}`);
//     }
//   }

//   // Collect keys from DB
//   const dbKeys = new Set<string>();
//   const cursor = CarModel.collection.find({}, { projection: { normalizedKey: 1 } });
//   for await (const doc of cursor as any) {
//     if (doc.normalizedKey) dbKeys.add(String(doc.normalizedKey));
//   }

//   // Compute diffs
//   const onlyInDb: string[] = [];
//   const onlyInSources: string[] = [];
//   for (const k of dbKeys) if (!expectedKeys.has(k)) onlyInDb.push(k);
//   for (const k of expectedKeys) if (!dbKeys.has(k)) onlyInSources.push(k);

//   onlyInDb.sort();
//   onlyInSources.sort();

//   console.log(`📊 DB total: ${dbKeys.size} | Source total: ${expectedKeys.size}`);
//   if (onlyInDb.length) {
//     console.log(`❗ Keys only in DB (candidates to delete):`);
//     for (const k of onlyInDb) console.log(`   - ${k}`);
//   } else {
//     console.log("✅ No DB-only keys.");
//   }

//   if (onlyInSources.length) {
//     console.log(`❗ Keys only in sources (not in DB yet):`);
//     for (const k of onlyInSources) console.log(`   - ${k}`);
//   } else {
//     console.log("✅ No source-only keys.");
//   }

//   await mongoose.disconnect();
//   console.log("🔌 Disconnected.");
// })().catch(async (e) => {
//   console.error("❌ Diagnose failed:", e);
//   try { await mongoose.disconnect(); } catch {}
//   process.exit(1);
// });
