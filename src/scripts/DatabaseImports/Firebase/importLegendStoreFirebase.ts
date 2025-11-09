import "dotenv/config";
import fs from "fs";
import { adminDb } from "@/Firebase/firebaseAdmin";

import {
  logLegendStoreConfig,
} from "@/scripts/DatabaseImports/Firebase/LegendStore/seedConfig";
import {
  getBlueprintFiles,
} from "@/scripts/DatabaseImports/Firebase/LegendStore/seedFs";
import {
  toBlueprintDoc,
} from "@/scripts/DatabaseImports/Firebase/LegendStore/seedNormalize";
import type {
  BlueprintSeed,
} from "@/scripts/DatabaseImports/Firebase/LegendStore/seedTypes";

const COLL_NAME = "blueprints"; // 1:1 with old BlueprintPricesModel ("Blueprints")

(async function main() {
  console.log("🌱 Seeding Legend Store blueprint prices into Firebase");
  logLegendStoreConfig();

  const files = getBlueprintFiles();
  if (!files.length) {
    console.error("❌ No LegendStore blueprint JSON files found.");
    process.exit(1);
  }

  if (process.env.NODE_ENV !== "production") {
    const snap = await adminDb.collection(COLL_NAME).get();
    if (!snap.empty) {
      let batch = adminDb.batch();
      let count = 0;

      snap.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
        if (count >= 450) {
          batch.commit();
          batch = adminDb.batch();
          count = 0;
        }
      });

      if (count > 0) {
        await batch.commit();
      }

      console.log(
        `🧼 Existing ${COLL_NAME} docs removed (non-prod): ${snap.size}`
      );
    } else {
      console.log(`🧼 No existing ${COLL_NAME} docs to remove (non-prod).`);
    }
  } else {
    console.log("🛑 Skipping delete in production.");
  }

  let total = 0;
  let ops = 0;

  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, "utf8");
      const parsed = JSON.parse(raw) as BlueprintSeed[] | unknown;

      if (!Array.isArray(parsed)) {
        console.warn(`⚠️ Expected array, skipping: ${file}`);
        continue;
      }

      let batch = adminDb.batch();
      let batchCount = 0;
      let fileCount = 0;

      for (const item of parsed as BlueprintSeed[]) {
        const { id, doc } = toBlueprintDoc(item);
        const ref = adminDb.collection(COLL_NAME).doc(id);

        batch.set(ref, doc, { merge: true });
        batchCount++;
        fileCount++;

        if (batchCount >= 450) {
          await batch.commit();
          ops += batchCount;
          batch = adminDb.batch();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        ops += batchCount;
      }

      total += fileCount;
      console.log(`✅ ${file} → ${fileCount} docs`);
    } catch (e: any) {
      console.warn(`⚠️ Failed ${file}: ${e.message || e}`);
    }
  }

  const finalSnap = await adminDb.collection(COLL_NAME).get();
  console.log(
    `📊 Final ${COLL_NAME} count: ${finalSnap.size} | Ops: ${ops} | Seeded (approx): ${total}`
  );
  console.log("✅ Legend Store blueprint import complete.");

  process.exit(0);
})().catch((e) => {
  console.error("❌ Legend Store Firebase import failed:", e);
  process.exit(1);
});