import path from "path";
import fs from "fs";

export const BLUEPRINT_ROOT_DIR = path.resolve(
  process.cwd(),
  "src/seeds/LegendStore/BlueprintData"
);

export const ROOT_DIR = BLUEPRINT_ROOT_DIR;

export const TRADE_COIN_ROOT_DIR = path.resolve(
  process.cwd(),
  "src/seeds/LegendStore/TradeCoinData"  // removed the 's'
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