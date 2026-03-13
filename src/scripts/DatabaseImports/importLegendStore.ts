import "dotenv/config";
import fs from "fs";
import { adminDb } from "@/Firebase/firebaseAdmin";

import { logLegendStoreConfig } from "@/scripts/DatabaseImports/LegendStore/seedConfig";
import { getBlueprintFiles } from "@/scripts/DatabaseImports/LegendStore/seedFs";
import { toBlueprintDoc } from "@/scripts/DatabaseImports/LegendStore/seedNormalize";
import type { BlueprintSeed } from "@/scripts/DatabaseImports/LegendStore/seedTypes";

const BLUEPRINT_COLL = "blueprints";
// const TRADE_COIN_COLL = "tradeCoins"; // uncomment when ready

(async function main() {
  console.log("🌱 Seeding Legend Store blueprint prices into Firebase");
  logLegendStoreConfig();

  const files = getBlueprintFiles();
  if (!files.length) {
    console.error("❌ No LegendStore blueprint JSON files found.");
    process.exit(1);
  }

  // ── Wipe existing docs in non-prod ──────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    for (const collName of [BLUEPRINT_COLL]) {
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
  } else {
    console.log("🛑 Skipping delete in production.");
  }

  // ── Seed blueprints ─────────────────────────────────────────────────────────
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
        const ref = adminDb.collection(BLUEPRINT_COLL).doc(id);

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

  // ── Seed Trade Coins ────────────────────────────────────────────────────────
  // Uncomment this entire block when TradeCoinsData folder is ready
  //
  // const tcFiles = getTradeCoinFiles();
  // for (const file of tcFiles) {
  //   try {
  //     const raw = fs.readFileSync(file, "utf8");
  //     const parsed = JSON.parse(raw) as TradeCoinSeed[] | unknown;
  //     if (!Array.isArray(parsed)) {
  //       console.warn(`⚠️ Expected array, skipping: ${file}`);
  //       continue;
  //     }
  //     let batch = adminDb.batch();
  //     let batchCount = 0;
  //     let fileCount = 0;
  //     for (const item of parsed as TradeCoinSeed[]) {
  //       const { id, doc } = toTradeCoinDoc(item);
  //       const ref = adminDb.collection(TRADE_COIN_COLL).doc(id);
  //       batch.set(ref, doc, { merge: true });
  //       batchCount++;
  //       fileCount++;
  //       if (batchCount >= 450) {
  //         await batch.commit();
  //         ops += batchCount;
  //         batch = adminDb.batch();
  //         batchCount = 0;
  //       }
  //     }
  //     if (batchCount > 0) {
  //       await batch.commit();
  //       ops += batchCount;
  //     }
  //     total += fileCount;
  //     console.log(`✅ ${file} → ${fileCount} docs`);
  //   } catch (e: any) {
  //     console.warn(`⚠️ Failed ${file}: ${e.message || e}`);
  //   }
  // }

  const finalSnap = await adminDb.collection(BLUEPRINT_COLL).get();
  console.log(
    `📊 Final ${BLUEPRINT_COLL} count: ${finalSnap.size} | Ops: ${ops} | Seeded: ${total}`
  );
  console.log("✅ Legend Store blueprint import complete.");

  process.exit(0);
})().catch((e) => {
  console.error("❌ Legend Store Firebase import failed:", e);
  process.exit(1);
});