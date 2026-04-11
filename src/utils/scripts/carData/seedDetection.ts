import type { StatLine, StarName } from "@/types/scripts/carData/seedTypes";

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