import { FieldValue } from "firebase-admin/firestore";

type AnyObj = Record<string, any>;

const STOCK_LEGACY_KEYS = [
  "stockRank",
  "stockTopSpeed",
  "stockAcceleration",
  "stockHandling",
  "stockNitro",
] as const;

const GOLD_LEGACY_KEYS = [
  "goldMaxRank",
  "goldTopSpeed",
  "goldAcceleration",
  "goldHandling",
  "goldNitro",
] as const;

// Add max-star legacy keys here when you migrate them into a nested structure:
const MAXSTAR_LEGACY_KEYS = [
  "oneStarMaxRank","oneStarMaxTopSpeed","oneStarMaxAcceleration","oneStarMaxHandling","oneStarMaxNitro",
  "twoStarMaxRank","twoStarMaxTopSpeed","twoStarMaxAcceleration","twoStarMaxHandling","twoStarMaxNitro",
  "threeStarMaxRank","threeStarMaxTopSpeed","threeStarMaxAcceleration","threeStarMaxHandling","threeStarMaxNitro",
  "fourStarMaxRank","fourStarMaxTopSpeed","fourStarMaxAcceleration","fourStarMaxHandling","fourStarMaxNitro",
  "fiveStarMaxRank","fiveStarMaxTopSpeed","fiveStarMaxAcceleration","fiveStarMaxHandling","fiveStarMaxNitro",
  "sixStarMaxRank","sixStarMaxTopSpeed","sixStarMaxAcceleration","sixStarMaxHandling","sixStarMaxNitro",
] as const;

/**
 * If a NEW nested group exists in the seed payload, we delete its legacy flat fields
 * in Firestore in the same update. This makes v2 idempotent and migration-safe.
 */
export function buildLegacyDeletesForV2(payload: AnyObj): AnyObj {
  const deletes: AnyObj = {};

  // If new nested stock exists, legacy stock must die forever.
  if (payload?.stock && typeof payload.stock === "object") {
    for (const k of STOCK_LEGACY_KEYS) deletes[k] = FieldValue.delete();
  }

  // If new nested gold exists, legacy gold must die forever.
  if (payload?.gold && typeof payload.gold === "object") {
    for (const k of GOLD_LEGACY_KEYS) deletes[k] = FieldValue.delete();
  }

  // Only enable this once you actually have a nested replacement (example name: maxStar)
  // if (payload?.maxStar && typeof payload.maxStar === "object") {
  //   for (const k of MAXSTAR_LEGACY_KEYS) deletes[k] = FieldValue.delete();
  // }

  return deletes;
}