// import fs from "fs";
// import path from "path";

// const ROOT_DIR = path.resolve(process.cwd(), "src/seeds/Brands");
// const isJson = (f: string) => /\.json$/i.test(f);
// const isTsCollector = (f: string) => /[/\\]Class[A-Z]\.ts$/i.test(f);

// function* walk(dir: string): Generator<string> {
//   if (!fs.existsSync(dir)) return;
//   for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
//     const p = path.join(dir, e.name);
//     if (e.isDirectory()) yield* walk(p);
//     else if (e.isFile()) yield p;
//   }
// }

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

// type CarDoc = Record<string, any>;
// const asArray = (x: any): CarDoc[] =>
//   Array.isArray(x) ? x : x && typeof x === "object" ? [x] : [];

// function loadJson(file: string): CarDoc[] {
//   try {
//     const raw = JSON.parse(fs.readFileSync(file, "utf8"));
//     return asArray(raw).map((o) => (Array.isArray(o) ? o[0] : o));
//   } catch {
//     return [];
//   }
// }

// function inc(map: Map<string, number>, key: string, by = 1) {
//   map.set(key, (map.get(key) ?? 0) + by);
// }

// (async function main() {
//   console.log("ROOT_DIR:", ROOT_DIR, "Exists:", fs.existsSync(ROOT_DIR));

//   const allFiles = Array.from(walk(ROOT_DIR)).filter(
//     (f) => isJson(f) || isTsCollector(f)
//   );

//   const collectorSet = new Set<string>();
//   for (const f of allFiles.filter(isTsCollector)) {
//     const { brand, klass } = parseBrandAndClass(f);
//     if (brand && klass) collectorSet.add(`${brand}::${klass}`);
//   }

//   let unionTotal = 0;
//   let selectedTotal = 0;
//   const unionByBrand = new Map<string, number>();
//   const selectedByBrand = new Map<string, number>();
//   const excludedClasses: Array<{ brand: string; klass: string; file: string; docs: number }> = [];

//   for (const f of allFiles.filter(isJson)) {
//     const docs = loadJson(f);
//     unionTotal += docs.length;

//     const { brand, klass } = parseBrandAndClass(f);
//     const brandName = brand ?? "(unknown)";
//     inc(unionByBrand, brandName, docs.length);

//     const hasCollector = brand && klass ? collectorSet.has(`${brand}::${klass}`) : false;

//     if (!hasCollector) {
//       selectedTotal += docs.length;
//       inc(selectedByBrand, brandName, docs.length);
//     } else if (docs.length) {
//       excludedClasses.push({ brand: brandName, klass: klass ?? "?", file: f, docs: docs.length });
//     }
//   }

//   const allBrands = new Set<string>([
//     ...unionByBrand.keys(),
//     ...selectedByBrand.keys(),
//   ]);
//   const rows = [...allBrands]
//     .map((b) => {
//       const u = unionByBrand.get(b) ?? 0;
//       const s = selectedByBrand.get(b) ?? 0;
//       return { brand: b, union: u, selected: s, delta: u - s };
//     })
//     .sort((a, b) => b.union - a.union || a.brand.localeCompare(b.brand));

//   console.log("\n========== SEEDS COUNT (by brand) ==========");
//   console.log(`JSON union (all JSON docs): ${unionTotal}`);
//   console.log(`Selected by current rules (JSON-only included): ${selectedTotal}`);
//   console.log("Brand\tUnion\tSelected\tDelta (skipped)");
//   rows.forEach((r) =>
//     console.log(`${r.brand}\t${r.union}\t${r.selected}\t\t${r.delta}`)
//   );

//   if (excludedClasses.length) {
//     console.log(
//       "\n---- Classes skipped due to collectors (JSON present but excluded) ----"
//     );
//     const grouped = new Map<
//       string,
//       { brand: string; klass: string; n: number; sample: string }
//     >();
//     for (const e of excludedClasses) {
//       const key = `${e.brand}::${e.klass}`;
//       const g =
//         grouped.get(key) ?? {
//           brand: e.brand,
//           klass: e.klass,
//           n: 0,
//           sample: e.file,
//         };
//       g.n += e.docs;
//       grouped.set(key, g);
//     }
//     [...grouped.values()]
//       .sort((a, b) => b.n - a.n || a.brand.localeCompare(b.brand))
//       .forEach((g) => {
//         console.log(
//           `${g.brand} [Class ${g.klass}] — JSON docs skipped: ${g.n} (e.g., ${path.relative(
//             process.cwd(),
//             g.sample
//           )})`
//         );
//       });
//   }

//   console.log(
//     "\nNOTE: Add the 'docs: N' totals from your seeder log for each ClassX.ts collector to the 'Selected' total to get the full expected count."
//   );
//   console.log("============================================\n");
// })();