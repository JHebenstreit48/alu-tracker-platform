import fs from "fs";
import path from "path";
import {
  BLUEPRINT_CREDITS_ROOT_DIR,
  TRADE_COINS_ROOT_DIR,
  IMPORTS_ROOT_DIR,
} from "./seedConfig";

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

export function getBlueprintCreditFiles(): string[] {
  return getJsonFilesRecursive(BLUEPRINT_CREDITS_ROOT_DIR);
}

export function getTradeCoinFiles(): string[] {
  return getJsonFilesRecursive(TRADE_COINS_ROOT_DIR);
}

export function getImportFiles(): string[] {
  return getJsonFilesRecursive(IMPORTS_ROOT_DIR);
}

// Keep old alias so existing importLegendStore.ts doesn't break
export const getBlueprintFiles = getBlueprintCreditFiles;