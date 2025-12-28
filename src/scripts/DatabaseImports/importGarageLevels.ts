import "dotenv/config";

import fs from "fs";
import path from "path";
import { adminDb, adminBucket } from "@/Firebase/firebaseAdmin";

try {
  // Allow TS collectors like GL1-10.ts at runtime (same as cars)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("ts-node/register/transpile-only");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("tsconfig-paths/register");
} catch (e) {
  console.warn("⚠️ ts-node/tsconfig-paths not loaded for GarageLevels.", e);
}

import {
  logGarageLevelsConfig,
  ROOT_DIR,
} from "@/scripts/DatabaseImports/GarageLevels/seedConfig";
import {
  getAllSeedFiles,
  isCollector,
  isPerLevelJson,
  parentFolderName,
} from "@/scripts/DatabaseImports/GarageLevels/seedFs";
import { loadLevelsFromFile } from "@/scripts/DatabaseImports/GarageLevels/seedLoadLevels";
import {
  enhanceLevels,
  rel as relPath,
} from "@/scripts/DatabaseImports/GarageLevels/seedEnhance";

const LEGACY_FILE = path.join(ROOT_DIR, "GarageLevels.json");
const COLL_NAME = "garagelevels"; // 1:1 with old GarageLevel collection

(async function main() {
  console.log(
    "🌱 Seeding garage levels into Firebase (collectors preferred; JSON fallback; legacy last)"
  );
  logGarageLevelsConfig(adminBucket?.name);

  const allFiles = getAllSeedFiles();

  if (!allFiles.length && !fs.existsSync(LEGACY_FILE)) {
    console.error("❌ No GarageLevels seed files found.");
    process.exit(1);
  }

  // 1) Collector files (TS or JSON arrays)
  const collectors = allFiles.filter(isCollector);

  // 2) Parent folders with collectors (to avoid double ingest)
  const coveredParents = new Set<string>();
  for (const c of collectors) {
    const parent = parentFolderName(c);
    if (parent) coveredParents.add(parent);
  }

  const filesToIngest: string[] = [...collectors];

  // 3) Per-level JSON only when no collector exists in that parent folder
  for (const f of allFiles.filter(isPerLevelJson)) {
    const parent = parentFolderName(f);
    if (!parent || !coveredParents.has(parent)) {
      filesToIngest.push(f);
    }
  }

  // 4) Legacy monolith only if nothing else selected
  if (!filesToIngest.length && fs.existsSync(LEGACY_FILE)) {
    filesToIngest.push(LEGACY_FILE);
  }

  console.log(`📄 Eligible files after de-dupe: ${filesToIngest.length}`);

  // Non-prod: wipe collection (mirrors deleteMany)
  if (process.env.NODE_ENV !== "production") {
    const snap = await adminDb.collection(COLL_NAME).get();
    if (!snap.empty) {
      let batch = adminDb.batch();
      let count = 0;

      snap.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
        if (count >= 450) {
          // commit and start a new batch
          batch.commit(); // fire-and-forget is fine here
          batch = adminDb.batch();
          count = 0;
        }
      });

      if (count > 0) {
        await batch.commit();
      }

      console.log(
        `🧼 Existing garage levels removed (non-prod): ${snap.size}`
      );
    } else {
      console.log("🧼 No existing garage levels to remove (non-prod).");
    }
  } else {
    console.log("🛑 Skipping delete in production.");
  }

  let opsTotal = 0;

  // Preload existing keys (for approximate insert/update logs only).
  // Dataset is tiny (≤ 60), so this is safe.
  const existingSnap = await adminDb.collection(COLL_NAME).get();
  const existingKeys = new Set<number>();
  existingSnap.forEach((doc) => {
    const key = doc.get("GarageLevelKey");
    if (typeof key === "number") existingKeys.add(key);
  });

  let insertedTotal = 0;
  let updatedTotal = 0;

  for (const file of filesToIngest) {
    try {
      const loaded = await loadLevelsFromFile(file);
      const levels = enhanceLevels(loaded);

      if (!levels.length) {
        console.warn(`⚠️ Skipped empty/invalid: ${relPath(file)}`);
        continue;
      }

      let batch = adminDb.batch();
      let batchCount = 0;

      let insertedForFile = 0;
      let updatedForFile = 0;

      for (const lvl of levels) {
        const id = String(lvl.GarageLevelKey).padStart(2, "0");
        const ref = adminDb.collection(COLL_NAME).doc(id);

        if (existingKeys.has(lvl.GarageLevelKey)) {
          updatedForFile++;
        } else {
          insertedForFile++;
          existingKeys.add(lvl.GarageLevelKey);
        }

        batch.set(ref, lvl, { merge: true });
        batchCount++;

        if (batchCount >= 450) {
          await batch.commit();
          opsTotal += batchCount;
          batch = adminDb.batch();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        opsTotal += batchCount;
      }

      insertedTotal += insertedForFile;
      updatedTotal += updatedForFile;

      console.log(
        `✅ ${relPath(file)} → updated: ${updatedForFile}, inserted: ${insertedForFile}`
      );
    } catch (e: any) {
      console.warn(`⚠️ Failed ${relPath(file)}: ${e.message || e}`);
    }
  }

  const finalSnap = await adminDb.collection(COLL_NAME).get();
  console.log(
    `📊 Levels total: ${finalSnap.size} | Ops: ${opsTotal} | Updated: ${updatedTotal} | Inserted (approx): ${insertedTotal}`
  );
  console.log("✅ Firebase GarageLevels import complete.");

  process.exit(0);
})().catch((e) => {
  console.error("❌ GarageLevels Firebase import failed:", e);
  process.exit(1);
});