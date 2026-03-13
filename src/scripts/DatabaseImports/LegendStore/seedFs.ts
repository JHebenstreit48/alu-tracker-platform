import fs from "fs";
import path from "path";
import { BLUEPRINT_ROOT_DIR, TRADE_COIN_ROOT_DIR } from "./seedConfig";

function getJsonFilesRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const results: string[] = [];

  const walk = (current: string): void => {
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".json")
      ) {
        results.push(fullPath);
      }
    }
  };

  walk(dir);
  return results;
}

export function getBlueprintFiles(): string[] {
  return getJsonFilesRecursive(BLUEPRINT_ROOT_DIR);
}

// Uncomment when TradeCoinsData folder is ready
// export function getTradeCoinFiles(): string[] {
//   return getJsonFilesRecursive(TRADE_COIN_ROOT_DIR);
// }