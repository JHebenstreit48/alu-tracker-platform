import fs from "fs";
import path from "path";
import type { SeedCar } from "@/types/scripts/seedTypes";
import { asArray } from "@/types/scripts/seedTypes";
import { isJson, isTsCollector } from "./seedFs";
import { remapToCanonicalCar } from "./seedKeyRemap";

type AnyObj = Record<string, unknown>;

export type SeedCarWithMeta = SeedCar & {
  __seedWasNewFormat?: boolean;
};

function toObject(o: unknown): AnyObj | null {
  if (!o || typeof o !== "object") return null;
  if (Array.isArray(o)) {
    const first = o[0];
    if (first && typeof first === "object" && !Array.isArray(first)) return first as AnyObj;
    return null;
  }
  return o as AnyObj;
}

function hydrate(x: unknown): SeedCarWithMeta[] {
  const items = asArray(x);
  const out: SeedCarWithMeta[] = [];

  for (const item of items) {
    const obj = toObject(item);
    if (!obj) continue;

    const { car, wasNewFormat } = remapToCanonicalCar(obj);
    out.push({ ...(car as SeedCar), __seedWasNewFormat: wasNewFormat });
  }

  return out;
}

export async function loadCarsFromFile(file: string): Promise<SeedCarWithMeta[]> {
  if (isJson(file)) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return hydrate(raw);
  }

  if (isTsCollector(file) || /[/\\]index\.ts$/i.test(file)) {
    const mod = await import(path.resolve(file));
    const anyMod = mod as { default?: unknown; cars?: unknown };
    const data = anyMod.default ?? anyMod.cars ?? [];
    return hydrate(data);
  }

  return [];
}