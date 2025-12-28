import fs from "fs";
import path from "path";
import { ROOT_DIR } from "./seedConfig";

export function getBlueprintFiles(): string[] {
  if (!fs.existsSync(ROOT_DIR)) return [];

  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });

  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".json"))
    .map((e) => path.join(ROOT_DIR, e.name));
}
