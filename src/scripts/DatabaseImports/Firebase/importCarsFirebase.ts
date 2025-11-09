import "dotenv/config";
import { adminDb, adminBucket } from "@/Firebase/firebaseAdmin";
import {
  getAllSeedFiles,
  isJson,
  isTsCollector,
  parseBrandAndClass,
} from "@/scripts/DatabaseImports/Firebase/Cars/seedFs";
import { logConfig } from "@/scripts/DatabaseImports/Firebase/Cars/seedConfig";
import {
  buildBuckets,
  applyBuckets,
} from "@/scripts/DatabaseImports/Firebase/Cars/seedBuckets";

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("ts-node/register/transpile-only");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("tsconfig-paths/register");
} catch (e) {
  console.warn("⚠️ ts-node/tsconfig-paths not loaded.", e);
}

(async function main(): Promise<void> {
  console.log("🌱 Seeding cars into Firebase");
  logConfig(adminBucket?.name);

  const allFiles = getAllSeedFiles();

  const collectorSet = new Set<string>();
  for (const f of allFiles.filter(isTsCollector)) {
    const { brand, klass } = parseBrandAndClass(f);
    if (brand && klass) collectorSet.add(`${brand}::${klass}`);
  }

  const includeClassJson =
    process.env.INCLUDE_CLASS_JSON_WITH_COLLECTOR === "1";
  const includePerCarJson =
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
      const base = f.split(/[\\/]/).pop()!.toLowerCase();
      if (/^class[a-z]\.json$/.test(base)) {
        if (!collectorSet.has(key) || includeClassJson) files.push(f);
      } else {
        if (!collectorSet.has(key) || includePerCarJson) files.push(f);
      }
    }
  }

  console.log(`📄 Eligible files after de-dupe: ${files.length}`);

  const { brandBuckets, expectedFromSeeds } = await buildBuckets(files);

  for (const [brand, bucket] of brandBuckets.entries()) {
    console.log(`📚 Brand ${brand}: ${bucket.docs.length} cars`);
  }

  const { carOps, statusOps } = await applyBuckets(brandBuckets);
  const finalSnap = await adminDb.collection("cars").get();

  console.log(`🧮 Expected from seeds (this run): ${expectedFromSeeds}`);
  console.log(
    `📊 Firestore cars total: ${finalSnap.size} | Car ops: ${carOps} | Status ops: ${statusOps}`
  );
  console.log("✅ Firebase car import complete.");

  process.exit(0);
})().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});