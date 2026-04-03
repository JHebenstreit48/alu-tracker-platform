import type { StarCount, StageRange } from "@/types/scripts/repairCar/index";

const STAGE_CAPS: Record<number, Record<number, number>> = {
  3: { 1: 5, 2: 8,  3: 10 },
  4: { 1: 4, 2: 7,  3: 9,  4: 11 },
  5: { 1: 3, 2: 6,  3: 8,  4: 10, 5: 12 },
  6: { 1: 3, 2: 6,  3: 8,  4: 10, 5: 12, 6: 13 },
};

export function getStageCaps(stars: StarCount): Record<number, number> {
  return STAGE_CAPS[stars] ?? STAGE_CAPS[6];
}

export function getStageRanges(stars: StarCount): StageRange[] {
  const caps = getStageCaps(stars);
  const ranges: StageRange[] = [];
  let prev = 0;
  for (let i = 1; i <= stars; i++) {
    ranges.push({ starRank: i, from: prev + 1, to: caps[i] });
    prev = caps[i];
  }
  return ranges;
}

export function getImportStages(stars: StarCount): number[] {
  const caps = getStageCaps(stars);
  return Object.values(caps);
}

export function isEmptyArray(val: unknown): boolean {
  return Array.isArray(val) && val.length === 0;
}

export function hasRealData(arr: unknown[]): boolean {
  return arr.some((item) => {
    if (!item || typeof item !== "object") return false;
    const obj = item as Record<string, unknown>;
    return Object.entries(obj).some(([k, v]) => {
      if (k === "stage" || k === "rarity") return false;
      if (typeof v === "number" && v !== 0) return true;
      if (v && typeof v === "object") {
        return Object.values(v as Record<string, unknown>).some(
          (n) => typeof n === "number" && n !== 0
        );
      }
      return false;
    });
  });
}

export function getMissingStages(
  existing: unknown[],
  from: number,
  to: number
): number[] {
  const existingStages = new Set(
    existing
      .filter((i) => i && typeof i === "object")
      .map((i) => (i as Record<string, unknown>).stage)
      .filter((s) => typeof s === "number") as number[]
  );
  const missing: number[] = [];
  for (let s = from; s <= to; s++) {
    if (!existingStages.has(s)) missing.push(s);
  }
  return missing;
}

export function isPlaceholderObject(obj: Record<string, unknown>): boolean {
  return Object.entries(obj).every(([k, v]) => {
    if (k === "stage" || k === "rarity") return true;
    if (typeof v === "number") return v === 0;
    if (v && typeof v === "object") {
      return Object.values(v as Record<string, unknown>).every(
        (n) => typeof n === "number" && n === 0
      );
    }
    return true;
  });
}