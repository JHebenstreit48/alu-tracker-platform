import "dotenv/config";

import fs from "fs";
import { adminDb, adminBucket } from "@/Firebase/firebaseAdmin";
import {
  getAllSeedFiles,
  isJson,
  isTsCollector,
  isCarFolderIndexTs,
  parseBrandAndClass,
} from "@/scripts/DatabaseImports/Cars/seedFs";
import { logConfig } from "@/scripts/DatabaseImports/Cars/seedConfig";
import { buildBuckets, applyBuckets } from "@/scripts/DatabaseImports/Cars/seedBuckets";

function getArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : undefined;
}

function parseKeys(keysArg?: string): string[] {
  if (!keysArg) return [];
  return keysArg
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function readKeysFile(filePath: string): string[] {
  const txt = fs.readFileSync(filePath, "utf8");
  return txt
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !s.startsWith("#"));
}

(async function main(): Promise<void> {
  const quiet = process.env.SEED_QUIET === "1";

  const keysArg = getArg("keys") || process.env.SEED_KEYS;
  const fileArg = getArg("file") || process.env.SEED_KEYS_FILE;

  let keys: string[] = parseKeys(keysArg);
  if (!keys.length && fileArg) keys = readKeysFile(fileArg);

  if (!keys.length) {
    console.error(
      `❌ Provide keys via --keys=a,b,c OR --file=path.txt (or env SEED_KEYS / SEED_KEYS_FILE)`
    );
    process.exit(1);
  }

  const onlyKeys = new Set(keys);

  if (!quiet) console.log(`🌱 Seeding SELECTED cars into Firebase: ${keys.length} key(s)`);
  logConfig(adminBucket?.name);

  const allFiles = getAllSeedFiles();

  const collectorSet = new Set<string>();
  for (const f of allFiles.filter(isTsCollector)) {
    const { brand, klass } = parseBrandAndClass(f);
    if (brand && klass) collectorSet.add(`${brand}::${klass}`);
  }

  const includeClassJson = process.env.INCLUDE_CLASS_JSON_WITH_COLLECTOR === "1";
  const includePerCarJson = process.env.INCLUDE_PER_CAR_WITH_COLLECTOR === "1";

  const files: string[] = [];
  for (const f of allFiles) {
    if (isCarFolderIndexTs(f)) {
      files.push(f);
      continue;
    }

    const { brand, klass } = parseBrandAndClass(f);
    if (!brand || !klass) {
      files.push(f);
      continue;
    }

    const bucketKey = `${brand}::${klass}`;

    if (isTsCollector(f)) {
      files.push(f);
      continue;
    }

    if (isJson(f)) {
      const base = f.split(/[\\/]/).pop()!.toLowerCase();
      if (/^class[a-z]\.json$/.test(base)) {
        if (!collectorSet.has(bucketKey) || includeClassJson) files.push(f);
      } else {
        if (!collectorSet.has(bucketKey) || includePerCarJson) files.push(f);
      }
    }
  }

  if (!quiet) console.log(`📄 Eligible files after de-dupe: ${files.length}`);

  const { brandBuckets, expectedFromSeeds } = await buildBuckets(files, { onlyKeys });

  const { carOps, statusOps } = await applyBuckets(brandBuckets, {
    onlyKeys,
    disablePrune: true,
  });

  let existsCount = 0;
  for (const k of keys) {
    const doc = await adminDb.collection("cars").doc(k).get();
    if (doc.exists) existsCount++;
  }

  console.log(`🧮 Expected from seeds (this run): ${expectedFromSeeds}`);
  console.log(`📄 Exists after seed: ${existsCount}/${keys.length}`);
  console.log(`📊 Ops: car=${carOps} status=${statusOps}`);
  console.log("✅ Selected-car seed complete.");

  process.exit(0);
})().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
