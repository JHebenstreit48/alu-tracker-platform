// import dotenv from "dotenv";
// dotenv.config();

// import fs from "fs";
// import path from "path";
// import mongoose from "mongoose";
// import CarModel from "@/models/car/schema";
// import { connectToDb } from "@/Utility/connection";

// type CarDoc = Record<string, any>;

// const ROOT_DIR = path.resolve(process.cwd(), "src/seeds/Brands");

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
//     if (folder && /^[A-D|S]$/i.test(folder)) klass = folder.toUpperCase();
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
//     const data = (mod as any).default ?? (mod as any).cars ?? [];
//     return asArray(data).map((o) => (Array.isArray(o) ? o[0] : o));
//   }
//   return [];
// }

// (async function main() {
//   // 1) Build the exact seed selection the importer uses
//   const allFiles = Array.from(walk(ROOT_DIR)).filter(f => isJson(f) || isTsCollector(f));

//   const collectorSet = new Set<string>();
//   for (const f of allFiles.filter(isTsCollector)) {
//     const { brand, klass } = parseBrandAndClass(f);
//     if (brand && klass) collectorSet.add(`${brand}::${klass}`);
//   }

//   const includeClassJsonWithCollector =
//     process.env.INCLUDE_CLASS_JSON_WITH_COLLECTOR === "1";
//   const includePerCarWithCollector =
//     process.env.INCLUDE_PER_CAR_WITH_COLLECTOR === "1";

//   const selectedFiles: string[] = [];
//   for (const f of allFiles) {
//     const { brand, klass } = parseBrandAndClass(f);

//     if (!brand || !klass) {
//       selectedFiles.push(f);
//       continue;
//     }

//     const key = `${brand}::${klass}`;

//     if (isTsCollector(f)) {
//       selectedFiles.push(f);
//       continue;
//     }

//     if (isJson(f)) {
//       const base = path.basename(f).toLowerCase();
//       if (/^class[a-z]\.json$/.test(base)) {
//         if (!collectorSet.has(key) || includeClassJsonWithCollector) selectedFiles.push(f);
//       } else {
//         if (!collectorSet.has(key) || includePerCarWithCollector) selectedFiles.push(f);
//       }
//     }
//   }

//   // 2) Read all selected seed docs → map by normalizedKey (or generated)
//   const seedMap = new Map<string, { Brand: string; Model: string; file: string }>();
//   const brandSelectedCounts = new Map<string, number>();

//   for (const file of selectedFiles) {
//     try {
//       const docs = await loadCarsFromFile(file);
//       for (const car of docs) {
//         const Brand = (car.Brand ?? "").toString();
//         const Model = (car.Model ?? "").toString();
//         const normalizedKey = (car.normalizedKey && String(car.normalizedKey).trim())
//           || (Brand && Model ? generateCarKey(Brand, Model) : "");

//         if (!Brand || !Model || !normalizedKey) continue;

//         seedMap.set(normalizedKey, { Brand, Model, file });
//         brandSelectedCounts.set(Brand, (brandSelectedCounts.get(Brand) ?? 0) + 1);
//       }
//     } catch {}
//   }

//   // 3) Pull DB docs → map by normalizedKey (fallback to generated if missing)
//   await connectToDb();
//   const dbDocs = await CarModel.find({}, { Brand: 1, Model: 1, normalizedKey: 1 }).lean();
//   const dbMap = new Map<string, { Brand: string; Model: string }>();
//   const brandDbCounts = new Map<string, number>();

//   for (const d of dbDocs) {
//     const Brand = (d.Brand ?? "").toString();
//     const Model = (d.Model ?? "").toString();
//     const key = (d.normalizedKey && String(d.normalizedKey).trim())
//       || (Brand && Model ? generateCarKey(Brand, Model) : "");
//     if (!Brand || !Model || !key) continue;

//     dbMap.set(key, { Brand, Model });
//     brandDbCounts.set(Brand, (brandDbCounts.get(Brand) ?? 0) + 1);
//   }

//   // 4) Diffs
//   const missingInDb: Array<{ key: string; Brand: string; Model: string; file: string }> = [];
//   for (const [k, v] of seedMap.entries()) {
//     if (!dbMap.has(k)) missingInDb.push({ key: k, ...v });
//   }

//   const extraInDb: Array<{ key: string; Brand: string; Model: string }> = [];
//   for (const [k, v] of dbMap.entries()) {
//     if (!seedMap.has(k)) extraInDb.push({ key: k, ...v });
//   }

//   // 5) Output
//   console.log("======== SEEDS vs DB (by normalizedKey) ========");
//   console.log(`Seeds total (selected by rules): ${seedMap.size}`);
//   console.log(`DB total: ${dbMap.size}\n`);

//   const allBrands = new Set([...brandSelectedCounts.keys(), ...brandDbCounts.keys()]);
//   console.log("Brand\tSeeds\tDB\tDelta(DB-Seeds)");
//   [...allBrands].sort().forEach(b => {
//     const s = brandSelectedCounts.get(b) ?? 0;
//     const d = brandDbCounts.get(b) ?? 0;
//     const delta = d - s;
//     console.log(`${b}\t${s}\t${d}\t${delta >= 0 ? "+"+delta : delta}`);
//   });

//   console.log("\n--- Missing in DB (in seeds, not in DB) ---");
//   if (missingInDb.length === 0) console.log("None");
//   else missingInDb.slice(0, 50).forEach(m =>
//     console.log(`${m.Brand} | ${m.Model} | key=${m.key} | file=${path.relative(process.cwd(), m.file)}`)
//   );

//   console.log("\n--- Extra in DB (in DB, not in seeds) ---");
//   if (extraInDb.length === 0) console.log("None");
//   else extraInDb.slice(0, 50).forEach(x =>
//     console.log(`${x.Brand} | ${x.Model} | key=${x.key}`)
//   );

//   await mongoose.disconnect();
//   console.log("\nDone.");
// })().catch(async (e) => {
//   console.error(e);
//   try { await mongoose.disconnect(); } catch {}
//   process.exit(1);
// });