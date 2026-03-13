import "dotenv/config";
import { logLegendStoreConfig } from "@/scripts/DatabaseImports/LegendStore/seedConfig";
import { seedBlueprintCredits } from "@/scripts/DatabaseImports/LegendStore/importBlueprintCredits";
import { seedTradeCoins } from "@/scripts/DatabaseImports/LegendStore/importTradeCoins";

(async function main() {
  console.log("🌱 Seeding all Legend Store data into Firebase");
  logLegendStoreConfig();

  await seedBlueprintCredits();
  await seedTradeCoins();

  console.log("✅ All Legend Store seeding complete.");
  process.exit(0);
})().catch((e) => {
  console.error("❌ Legend Store import failed:", e);
  process.exit(1);
});