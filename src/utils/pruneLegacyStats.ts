export type AnyObj = Record<string, any>;

export type MaxStarKey =
  | "oneStar"
  | "twoStar"
  | "threeStar"
  | "fourStar"
  | "fiveStar"
  | "sixStar";

const STAR_PREFIXES: MaxStarKey[] = [
  "oneStar",
  "twoStar",
  "threeStar",
  "fourStar",
  "fiveStar",
  "sixStar",
];

/**
 * Deletes legacy flat keys ONLY when the corresponding nested block exists.
 * Safe for partial migrations.
 *
 * Returns true if anything was deleted.
 */
export function pruneLegacyStats(obj: AnyObj): boolean {
  let changed = false;

  // Stock legacy keys -> only prune if obj.stock.stock exists
  if (obj?.stock?.stock) {
    const keys = [
      "stockRank",
      "stockTopSpeed",
      "stockAcceleration",
      "stockHandling",
      "stockNitro",
    ];
    for (const k of keys) {
      if (k in obj) {
        delete obj[k];
        changed = true;
      }
    }
  }

  // Gold legacy keys -> only prune if obj.gold.gold exists
  if (obj?.gold?.gold) {
    const keys = [
      "goldMaxRank",
      "goldTopSpeed",
      "goldAcceleration",
      "goldHandling",
      "goldNitro",
    ];
    for (const k of keys) {
      if (k in obj) {
        delete obj[k];
        changed = true;
      }
    }
  }

  // MaxStar legacy keys -> only prune if obj.maxStar has at least one tier present
  if (
    obj?.maxStar &&
    typeof obj.maxStar === "object" &&
    Object.keys(obj.maxStar).length > 0
  ) {
    for (const prefix of STAR_PREFIXES) {
      const keys = [
        `${prefix}MaxRank`,
        `${prefix}MaxTopSpeed`,
        `${prefix}MaxAcceleration`,
        `${prefix}MaxHandling`,
        `${prefix}MaxNitro`,
      ];

      for (const k of keys) {
        if (k in obj) {
          delete obj[k];
          changed = true;
        }
      }
    }
  }

  return changed;
}