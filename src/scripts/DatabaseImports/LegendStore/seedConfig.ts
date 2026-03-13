import path from "path";
import fs from "fs";

export const BLUEPRINT_CREDITS_ROOT_DIR = path.resolve(
  process.cwd(),
  "src/seeds/LegendStore/Blueprints/CreditsCost"
);

export const TRADE_COINS_ROOT_DIR = path.resolve(
  process.cwd(),
  "src/seeds/LegendStore/Blueprints/TradeCoinsCost"
);

export const IMPORTS_ROOT_DIR = path.resolve(
  process.cwd(),
  "src/seeds/LegendStore/Imports"
);

// Keep old aliases so nothing breaks during transition
export const ROOT_DIR = BLUEPRINT_CREDITS_ROOT_DIR;
export const BLUEPRINT_ROOT_DIR = BLUEPRINT_CREDITS_ROOT_DIR;
export const TRADE_COIN_ROOT_DIR = TRADE_COINS_ROOT_DIR;

export const logLegendStoreConfig = (): void => {
  console.log(
    "📁 BLUEPRINT_CREDITS_ROOT_DIR:",
    BLUEPRINT_CREDITS_ROOT_DIR,
    "exists:",
    fs.existsSync(BLUEPRINT_CREDITS_ROOT_DIR)
  );
  console.log(
    "📁 TRADE_COINS_ROOT_DIR:",
    TRADE_COINS_ROOT_DIR,
    "exists:",
    fs.existsSync(TRADE_COINS_ROOT_DIR)
  );
  console.log(
    "📁 IMPORTS_ROOT_DIR:",
    IMPORTS_ROOT_DIR,
    "exists:",
    fs.existsSync(IMPORTS_ROOT_DIR)
  );
};