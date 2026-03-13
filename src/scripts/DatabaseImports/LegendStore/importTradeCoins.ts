import "dotenv/config";
import fs from "fs";
import { adminDb } from "@/Firebase/firebaseAdmin";
import { logLegendStoreConfig } from "@/scripts/DatabaseImports/LegendStore/seedConfig";
import {
  getTradeCoinFiles,
  getImportFiles,
} from "@/scripts/DatabaseImports/LegendStore/seedFs";
import {
  toTradeCoinDoc,
  toImportDoc,
} from "@/scripts/DatabaseImports/LegendStore/seedNormalize";
import type {
  TradeCoinSeed,
  ImportSeed,
} from "@/scripts/DatabaseImports/LegendStore/seedTypes";

const TC_COLL = "blueprintTradeCoins";
const IMPORT_COLL = "importTradeCoins";

async function clearCollection(collName: string): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    console.log("🛑 Skipping delete in production.");
    return;
  }
  const snap = await adminDb.collection(collName).get();
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
    console.log(`🧼 Cleared ${collName}: ${snap.size} docs removed`);
  } else {
    console.log(`🧼 ${collName} already empty`);
  }
}

async function seedFiles<T>(
  files: string[],
  collName: string,
  toDoc: (item: T) => { id: string; doc: any }
): Promise<void> {
  let total = 0;
  let ops = 0;

  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, "utf8");
      const parsed = JSON.parse(raw) as T[] | unknown;

      if (!Array.isArray(parsed)) {
        console.warn(`⚠️ Expected array, skipping: ${file}`);
        continue;
      }

      let batch = adminDb.batch();
      let batchCount = 0;
      let fileCount = 0;

      for (const item of parsed as T[]) {
        const { id, doc } = toDoc(item);
        const ref = adminDb.collection(collName).doc(id);
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

  const finalSnap = await adminDb.collection(collName).get();
  console.log(
    `📊 Final ${collName} count: ${finalSnap.size} | Ops: ${ops} | Seeded: ${total}`
  );
}

export async function seedTradeCoins(): Promise<void> {
  console.log("🌱 Seeding Trade Coins into Firebase");
  logLegendStoreConfig();

  // Blueprint Trade Coins
  await clearCollection(TC_COLL);
  const tcFiles = getTradeCoinFiles();
  if (tcFiles.length) {
    await seedFiles<TradeCoinSeed>(tcFiles, TC_COLL, toTradeCoinDoc);
    console.log("✅ Blueprint Trade Coins complete.");
  } else {
    console.log("⚠️ No Blueprint Trade Coin files found — skipping.");
  }

  // Import Trade Coins
  await clearCollection(IMPORT_COLL);
  const importFiles = getImportFiles();
  if (importFiles.length) {
    await seedFiles<ImportSeed>(importFiles, IMPORT_COLL, toImportDoc);
    console.log("✅ Import Trade Coins complete.");
  } else {
    console.log("⚠️ No Import files found — skipping.");
  }
}

if (require.main === module) {
  seedTradeCoins()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Trade Coins import failed:", e);
      process.exit(1);
    });
}