import fs from "fs";
import path from "path";
import { LevelSeed, asArray } from "./seedTypes";
import { isJson, isCollectorTs } from "./seedFs";

// ts-node/tsconfig-paths are registered in the main entry (import script)

export async function loadLevelsFromFile(file: string): Promise<LevelSeed[]> {
  if (isJson(file)) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    // JSON collectors hold an array; per-level JSON is a single object
    return asArray<LevelSeed>(raw);
  }

  if (isCollectorTs(file)) {
    const mod = await import(path.resolve(file));
    const anyMod = mod as { default?: unknown; levels?: unknown };
    const data = anyMod.default ?? anyMod.levels ?? [];
    return asArray<LevelSeed>(data);
  }

  return [];
}