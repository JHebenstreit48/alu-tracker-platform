import type { StarCount, StageRange } from "@/types/scripts/repairCar/index";
import {
  getStageRanges,
  getImportStages,
  isEmptyArray,
  hasRealData,
  getMissingStages,
} from "@/scripts/maintenance/carDataRepair/repairChecks";

type AnyObj = Record<string, unknown>;

function statBlock() {
  return { topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 };
}

function placeholderStatsStage(stage: number): AnyObj {
  return { stage, rank: 0, topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 };
}

function placeholderDeltaStage(stage: number): AnyObj {
  return { stage, rankByStat: statBlock(), statByStat: statBlock() };
}

function placeholderImportStage(stage: number): AnyObj {
  return {
    stage,
    rarity: "uncommon",
    rankByStat: statBlock(),
    statByStat: statBlock(),
  };
}

export function repairStatsStagesFile(
  existing: unknown[],
  range: StageRange
): { result: unknown[]; changed: boolean } {
  if (isEmptyArray(existing)) {
    const result = [];
    for (let s = range.from; s <= range.to; s++) result.push(placeholderStatsStage(s));
    return { result, changed: true };
  }

  const missing = getMissingStages(existing, range.from, range.to);
  if (missing.length === 0) return { result: existing, changed: false };

  const result = [
    ...existing,
    ...missing.map(placeholderStatsStage),
  ].sort((a, b) => {
    const aS = (a as AnyObj).stage as number;
    const bS = (b as AnyObj).stage as number;
    return aS - bS;
  });

  return { result, changed: true };
}

export function repairDeltaStagesFile(
  existing: unknown[],
  range: StageRange
): { result: unknown[]; changed: boolean } {
  if (isEmptyArray(existing)) {
    const result = [];
    for (let s = range.from; s <= range.to; s++) result.push(placeholderDeltaStage(s));
    return { result, changed: true };
  }

  const missing = getMissingStages(existing, range.from, range.to);
  if (missing.length === 0) return { result: existing, changed: false };

  const result = [
    ...existing,
    ...missing.map(placeholderDeltaStage),
  ].sort((a, b) => {
    const aS = (a as AnyObj).stage as number;
    const bS = (b as AnyObj).stage as number;
    return aS - bS;
  });

  return { result, changed: true };
}

export function repairDeltaImportsFile(
  existing: unknown[],
  stageCap: number
): { result: unknown[]; changed: boolean } {
  if (isEmptyArray(existing)) {
    return { result: [placeholderImportStage(stageCap)], changed: true };
  }
  return { result: existing, changed: false };
}

export function repairStatsObject(
  existing: AnyObj,
  template: AnyObj
): { result: AnyObj; changed: boolean } {
  let changed = false;
  const result = { ...existing };
  for (const [key, val] of Object.entries(template)) {
    if (!(key in result)) {
      result[key] = val;
      changed = true;
    } else if (
      val && typeof val === "object" &&
      result[key] && typeof result[key] === "object"
    ) {
      const inner = result[key] as AnyObj;
      const templateInner = val as AnyObj;
      for (const [ik, iv] of Object.entries(templateInner)) {
        if (!(ik in inner)) {
          inner[ik] = iv;
          changed = true;
        }
      }
    }
  }
  return { result, changed };
}

export function repairUpgradesStagesObject(
  existing: AnyObj,
  maxStage: number
): { result: AnyObj; changed: boolean } {
  let changed = false;
  const result = { ...existing };
  const inner = (result.perUpgradeByStage ?? {}) as AnyObj;
  for (let i = 1; i <= maxStage; i++) {
    if (!(String(i) in inner)) {
      inner[String(i)] = 0;
      changed = true;
    }
  }
  result.perUpgradeByStage = inner;
  return { result, changed };
}

export function repairImportsObject(
  existing: AnyObj,
  importStages: number[],
  type: "costs" | "garageLevelXp" | "requirements"
): { result: AnyObj; changed: boolean } {
  let changed = false;
  const result = { ...existing };
  const key = type === "requirements" ? "incrementalByStage" : "perCardByStage";
  const inner = (result[key] ?? {}) as AnyObj;

  for (const s of importStages) {
    if (!(String(s) in inner)) {
      if (type === "requirements") {
        inner[String(s)] = {
          uncommon: statBlock(),
          rare: statBlock(),
          epic: statBlock(),
        };
      } else {
        inner[String(s)] = { uncommon: 0 };
      }
      changed = true;
    }
  }

  result[key] = inner;
  return { result, changed };
}