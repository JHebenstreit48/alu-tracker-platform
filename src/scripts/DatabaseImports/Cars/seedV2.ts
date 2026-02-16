import type { SeedCar } from "@/types/scripts/seedTypes";

type StatLine = {
  rank?: number;
  topSpeed?: number;
  acceleration?: number;
  handling?: number;
  nitro?: number;
};

type StarName =
  | "oneStar"
  | "twoStar"
  | "threeStar"
  | "fourStar"
  | "fiveStar"
  | "sixStar";

const STAR_NAMES: StarName[] = [
  "oneStar",
  "twoStar",
  "threeStar",
  "fourStar",
  "fiveStar",
  "sixStar",
];

function isObj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function looksLikeStatLine(x: unknown): x is StatLine {
  if (!isObj(x)) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.rank === "number" ||
    typeof o.topSpeed === "number" ||
    typeof o.acceleration === "number" ||
    typeof o.handling === "number" ||
    typeof o.nitro === "number"
  );
}

/**
 * V2 detection (no schemaVersion needed)
 * True if doc includes V2 structured stats:
 * - maxStar: { oneStar: {rank...}, ... }
 * - stages: { oneStar: [ {stage, rank...}, ... ], ... }
 * - (optional) stock/gold as stat lines: { rank, topSpeed, ... }
 */
export function isV2Seed(doc: Record<string, unknown>): boolean {
  if (isObj(doc.maxStar)) {
    const ms = doc.maxStar as Record<string, unknown>;
    for (const k of STAR_NAMES) {
      if (k in ms && looksLikeStatLine(ms[k])) return true;
    }
  }

  if (isObj(doc.stages)) {
    const st = doc.stages as Record<string, unknown>;
    for (const k of STAR_NAMES) {
      if (k in st && Array.isArray(st[k])) return true;
    }
  }

  if (looksLikeStatLine(doc.stock)) return true;
  if (looksLikeStatLine(doc.gold)) return true;

  return false;
}

function setLegacyStock(out: SeedCar, stock: StatLine): void {
  if (stock.rank != null) out.stockRank = stock.rank;
  if (stock.topSpeed != null) out.stockTopSpeed = stock.topSpeed;
  if (stock.acceleration != null) out.stockAcceleration = stock.acceleration;
  if (stock.handling != null) out.stockHandling = stock.handling;
  if (stock.nitro != null) out.stockNitro = stock.nitro;
}

function setLegacyGold(out: SeedCar, gold: StatLine): void {
  if (gold.rank != null) out.goldMaxRank = gold.rank;
  if (gold.topSpeed != null) out.goldTopSpeed = gold.topSpeed;
  if (gold.acceleration != null) out.goldAcceleration = gold.acceleration;
  if (gold.handling != null) out.goldHandling = gold.handling;
  if (gold.nitro != null) out.goldNitro = gold.nitro;
}

function setLegacyMaxStar(out: SeedCar, maxStar: Partial<Record<StarName, StatLine>>): void {
  const prefixMap: Record<StarName, string> = {
    oneStar: "oneStarMax",
    twoStar: "twoStarMax",
    threeStar: "threeStarMax",
    fourStar: "fourStarMax",
    fiveStar: "fiveStarMax",
    sixStar: "sixStarMax",
  };

  for (const star of STAR_NAMES) {
    const line = maxStar[star];
    if (!line) continue;

    const prefix = prefixMap[star];
    if (line.rank != null) (out as any)[`${prefix}Rank`] = line.rank;
    if (line.topSpeed != null) (out as any)[`${prefix}TopSpeed`] = line.topSpeed;
    if (line.acceleration != null) (out as any)[`${prefix}Acceleration`] = line.acceleration;
    if (line.handling != null) (out as any)[`${prefix}Handling`] = line.handling;
    if (line.nitro != null) (out as any)[`${prefix}Nitro`] = line.nitro;
  }
}

function coerceStatLine(x: unknown): StatLine | null {
  if (!looksLikeStatLine(x)) return null;
  const o = x as Record<string, unknown>;
  const out: StatLine = {};
  if (typeof o.rank === "number") out.rank = o.rank;
  if (typeof o.topSpeed === "number") out.topSpeed = o.topSpeed;
  if (typeof o.acceleration === "number") out.acceleration = o.acceleration;
  if (typeof o.handling === "number") out.handling = o.handling;
  if (typeof o.nitro === "number") out.nitro = o.nitro;
  return out;
}

/**
 * Legacy flat emission (compat) — OPT-IN ONLY.
 *
 * If enabled, it will emit legacy flat keys from V2 structures.
 * For your migration workflow, keep this OFF so pruned legacy never returns.
 *
 * Enable explicitly only if needed:
 *   SEED_EMIT_LEGACY_FLAT_STATS=1
 *
 * Default: OFF.
 */
export function applyV2LegacyKeys(car: SeedCar): SeedCar {
  const emitLegacy = process.env.SEED_EMIT_LEGACY_FLAT_STATS === "1";
  const anyCar = car as any;

  if (!emitLegacy) return car;
  if (!isV2Seed(anyCar)) return car;

  const out: SeedCar = { ...(car as any) };

  const stockLine = coerceStatLine(anyCar.stock);
  if (stockLine) setLegacyStock(out, stockLine);

  const goldLine = coerceStatLine(anyCar.gold);
  if (goldLine) setLegacyGold(out, goldLine);

  if (isObj(anyCar.maxStar)) {
    const ms = anyCar.maxStar as Partial<Record<StarName, unknown>>;
    const mapped: Partial<Record<StarName, StatLine>> = {};
    for (const star of STAR_NAMES) {
      const line = coerceStatLine(ms[star]);
      if (line) mapped[star] = line;
    }
    setLegacyMaxStar(out, mapped);
  }

  // stages: no legacy equivalent; keep V2 only.

  return out;
}