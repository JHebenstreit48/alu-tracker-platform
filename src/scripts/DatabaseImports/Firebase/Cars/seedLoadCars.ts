import fs from "fs";
import path from "path";
import { SeedCar, asArray } from "./seedTypes";
import { isJson, isTsCollector } from "./seedFs";

// ts-node/tsconfig-paths are registered in the main entry

export async function loadCarsFromFile(file: string): Promise<SeedCar[]> {
  if (isJson(file)) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return asArray(raw).map((o) =>
      Array.isArray(o) ? (o[0] as SeedCar) : (o as SeedCar)
    );
  }

  if (isTsCollector(file)) {
    const mod = await import(path.resolve(file));
    const anyMod = mod as { default?: unknown; cars?: unknown };
    const data = anyMod.default ?? anyMod.cars ?? [];
    return asArray(data).map((o) =>
      Array.isArray(o) ? (o[0] as SeedCar) : (o as SeedCar)
    );
  }

  return [];
}