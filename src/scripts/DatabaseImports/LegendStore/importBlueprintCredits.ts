import "dotenv/config";
import fs from "fs";
import { adminDb } from "@/Firebase/firebaseAdmin";
import { logLegendStoreConfig } from "@/scripts/DatabaseImports/LegendStore/seedConfig";
import { getBlueprintCreditFiles } from "@/scripts/DatabaseImports/LegendStore/seedFs";
import { toBlueprintDoc } from "@/scripts/DatabaseImports/LegendStore/seedNormalize";
import type { BlueprintSeed } from "@/scripts/DatabaseImports/LegendStore/seedTypes";

const COLL = "blueprintCredits";

export async function seedBlueprintCredits(): Promise<void> {
  console.log("🌱 Seeding Blueprint Credits into Firebase");
  logLegendStoreConfig();

  const files = getBlueprintCreditFiles();
  if (!files.length) {
    console.error("❌ No Blueprint Credits JSON files found.");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    const snap = await adminDb.collection(COLL).get();
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
      if (count > 0) await batch.commit();
      console.log(`🧼 Cleared ${COLL}: ${snap.size} docs removed`);
    } else {
      console.log(`🧼 ${COLL} already empty`);
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
        const ref = adminDb.collection(COLL).doc(id);
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

  const finalSnap = await adminDb.collection(COLL).get();
  console.log(
    `📊 Final ${COLL} count: ${finalSnap.size} | Ops: ${ops} | Seeded: ${total}`
  );
  console.log("✅ Blueprint Credits import complete.");
}

if (require.main === module) {
  seedBlueprintCredits()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Blueprint Credits import failed:", e);
      process.exit(1);
    });
}