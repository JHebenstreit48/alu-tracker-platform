import type { SeedCar } from "@/types/scripts/seedTypes";

type AnyObj = Record<string, unknown>;

const NEW_KEYS = new Set<string>([
  "id",
  "image",
  "class",
  "brand",
  "model",
  "normalizedKey",
  "rarity",
  "stars",
  "keyCar",
  "country",
  "epics",
  "obtainableVia",
  "added",
  "addedDate",
  "addedWith",
  "totalUpgradeCost",
  "totalGlPoints",
  "blueprints1Star",
  "blueprints2Star",
  "blueprints3Star",
  "blueprints4Star",
  "blueprints5Star",
  "blueprints6Star",
  "goldMaxRank",
  "goldTopSpeed",
  "goldAcceleration",
  "goldHandling",
  "goldNitro",
  "stockRank",
  "stockTopSpeed",
  "stockAcceleration",
  "stockHandling",
  "stockNitro",
  "oneStarMaxRank",
  "oneStarMaxTopSpeed",
  "oneStarMaxAcceleration",
  "oneStarMaxHandling",
  "oneStarMaxNitro",
  "twoStarMaxRank",
  "twoStarMaxTopSpeed",
  "twoStarMaxAcceleration",
  "twoStarMaxHandling",
  "twoStarMaxNitro",
  "threeStarMaxRank",
  "threeStarMaxTopSpeed",
  "threeStarMaxAcceleration",
  "threeStarMaxHandling",
  "threeStarMaxNitro",
  "fourStarMaxRank",
  "fourStarMaxTopSpeed",
  "fourStarMaxAcceleration",
  "fourStarMaxHandling",
  "fourStarMaxNitro",
  "fiveStarMaxRank",
  "fiveStarMaxTopSpeed",
  "fiveStarMaxAcceleration",
  "fiveStarMaxHandling",
  "fiveStarMaxNitro",
  "sixStarMaxRank",
  "sixStarMaxTopSpeed",
  "sixStarMaxAcceleration",
  "sixStarMaxHandling",
  "sixStarMaxNitro",
  "status",
  "message",
  "sources",
  "tags",
]);

const LEGACY_TO_CAMEL: Record<string, string> = {
  Id: "id",
  Image: "image",
  Class: "class",
  Brand: "brand",
  Model: "model",

  Rarity: "rarity",
  Stars: "stars",
  KeyCar: "keyCar",
  Country: "country",
  Epics: "epics",

  ObtainableVia: "obtainableVia",

  Added: "added",
  Added_With: "addedWith",
  "Added date": "addedDate",

  "Total upgrade cost": "totalUpgradeCost",
  "Total GL points": "totalGlPoints",

  BPs_1_Star: "blueprints1Star",
  BPs_2_Star: "blueprints2Star",
  BPs_3_Star: "blueprints3Star",
  BPs_4_Star: "blueprints4Star",
  BPs_5_Star: "blueprints5Star",
  BPs_6_Star: "blueprints6Star",

  Stock_Rank: "stockRank",
  Stock_Top_Speed: "stockTopSpeed",
  Stock_Acceleration: "stockAcceleration",
  Stock_Handling: "stockHandling",
  Stock_Nitro: "stockNitro",

  One_Star_Max_Rank: "oneStarMaxRank",
  One_Star_Max_Top_Speed: "oneStarMaxTopSpeed",
  One_Star_Max_Acceleration: "oneStarMaxAcceleration",
  One_Star_Max_Handling: "oneStarMaxHandling",
  One_Star_Max_Nitro: "oneStarMaxNitro",

  Two_Star_Max_Rank: "twoStarMaxRank",
  Two_Star_Max_Top_Speed: "twoStarMaxTopSpeed",
  Two_Star_Max_Acceleration: "twoStarMaxAcceleration",
  Two_Star_Max_Handling: "twoStarMaxHandling",
  Two_Star_Max_Nitro: "twoStarMaxNitro",

  Three_Star_Max_Rank: "threeStarMaxRank",
  Three_Star_Max_Top_Speed: "threeStarMaxTopSpeed",
  Three_Star_Max_Acceleration: "threeStarMaxAcceleration",
  Three_Star_Max_Handling: "threeStarMaxHandling",
  Three_Star_Max_Nitro: "threeStarMaxNitro",

  Four_Star_Max_Rank: "fourStarMaxRank",
  Four_Star_Max_Top_Speed: "fourStarMaxTopSpeed",
  Four_Star_Max_Acceleration: "fourStarMaxAcceleration",
  Four_Star_Max_Handling: "fourStarMaxHandling",
  Four_Star_Max_Nitro: "fourStarMaxNitro",

  Five_Star_Max_Rank: "fiveStarMaxRank",
  Five_Star_Max_Top_Speed: "fiveStarMaxTopSpeed",
  Five_Star_Max_Acceleration: "fiveStarMaxAcceleration",
  Five_Star_Max_Handling: "fiveStarMaxHandling",
  Five_Star_Max_Nitro: "fiveStarMaxNitro",

  Six_Star_Max_Rank: "sixStarMaxRank",
  Six_Star_Max_Top_Speed: "sixStarMaxTopSpeed",
  Six_Star_Max_Acceleration: "sixStarMaxAcceleration",
  Six_Star_Max_Handling: "sixStarMaxHandling",
  Six_Star_Max_Nitro: "sixStarMaxNitro",

  Gold_Max_Rank: "goldMaxRank",
  Gold_Top_Speed: "goldTopSpeed",
  Gold_Acceleration: "goldAcceleration",
  Gold_Handling: "goldHandling",
  Gold_Nitro: "goldNitro",

  Tags: "tags",
};

export function isLikelyNewFormat(doc: AnyObj): boolean {
  for (const k of Object.keys(doc)) {
    if (NEW_KEYS.has(k)) return true;
  }
  return false;
}

export type RemapResult = {
  car: SeedCar;
  wasNewFormat: boolean;
};

function normalizeObtainableVia(v: unknown): string[] | undefined {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return undefined;
    return [s];
  }
  return undefined;
}

export function remapToCanonicalCar(raw: AnyObj): RemapResult {
  const wasNewFormat = isLikelyNewFormat(raw);
  const out: AnyObj = {};

  for (const [k, v] of Object.entries(raw)) {
    if (k === "__seedWasNewFormat") continue;

    if (NEW_KEYS.has(k)) {
      out[k] = v;
      continue;
    }

    const mapped = LEGACY_TO_CAMEL[k];
    if (mapped) out[mapped] = v;
  }

  const ov = normalizeObtainableVia(out.obtainableVia);
  if (ov) out.obtainableVia = ov;

  return { car: out as SeedCar, wasNewFormat };
}