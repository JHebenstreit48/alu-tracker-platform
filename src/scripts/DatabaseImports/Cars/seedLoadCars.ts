import fs from "fs";
import path from "path";
import { SeedCar, asArray } from "./seedTypes";
import { isJson, isTsCollector } from "./seedFs";
import { remapToLegacyCar } from "./seedKeyRemap";

type AnyObj = Record<string, unknown>;

export async function loadCarsFromFile(file: string): Promise<SeedCar[]> {
  const hydrate = (x: unknown): SeedCar[] =>
    asArray(x).map((o) => {
      const obj = Array.isArray(o) ? (o[0] as AnyObj) : (o as AnyObj);
      return remapToLegacyCar(obj);
    });

  if (isJson(file)) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return hydrate(raw);
  }

  // collector OR folder override index.ts
  if (isTsCollector(file) || /[/\\]index\.ts$/i.test(file)) {
    const mod = await import(path.resolve(file));
    const anyMod = mod as { default?: unknown; cars?: unknown };
    const data = anyMod.default ?? anyMod.cars ?? [];
    return hydrate(data);
  }

  return [];
}