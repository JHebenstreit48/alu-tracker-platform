import path from "path";
import fs from "fs";

export const BLUEPRINT_ROOT_DIR = path.resolve(
  process.cwd(),
  "src/seeds/LegendStore/BlueprintData"
);

// Keeping old name as alias so importLegendStore.ts doesn't break yet
export const ROOT_DIR = BLUEPRINT_ROOT_DIR;

export const TRADE_COIN_ROOT_DIR = path.resolve(
  process.cwd(),
  "src/seeds/LegendStore/TradeCoinsData"
);

export const logLegendStoreConfig = (): void => {
  console.log(
    "📁 BLUEPRINT_ROOT_DIR:",
    BLUEPRINT_ROOT_DIR,
    "exists:",
    fs.existsSync(BLUEPRINT_ROOT_DIR)
  );
  console.log(
    "📁 TRADE_COIN_ROOT_DIR:",
    TRADE_COIN_ROOT_DIR,
    "exists:",
    fs.existsSync(TRADE_COIN_ROOT_DIR)
  );
};