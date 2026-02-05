import { SeedCar } from "./seedTypes";

type AnyObj = Record<string, unknown>;

/**
 * Seed migration helper:
 * - Accepts NEW camelCase keys in seed files
 * - Accepts OLD legacy keys in seed files
 * - Outputs LEGACY keys for Firestore so the deployed frontend keeps working
 */
export function remapToLegacyCar(raw: AnyObj): SeedCar {
  const out: AnyObj = { ...raw };

  // Core identity (new -> legacy)
  if (raw.brand !== undefined && out.Brand === undefined) out.Brand = raw.brand;
  if (raw.model !== undefined && out.Model === undefined) out.Model = raw.model;
  if (raw.image !== undefined && out.Image === undefined) out.Image = raw.image;
  if (raw.class !== undefined && out.Class === undefined) out.Class = raw.class;
  if (raw.id !== undefined && out.Id === undefined) out.Id = raw.id;

  // Meta
  if (raw.rarity !== undefined && out.Rarity === undefined) out.Rarity = raw.rarity;
  if (raw.stars !== undefined && out.Stars === undefined) out.Stars = raw.stars;
  if (raw.keyCar !== undefined && out.KeyCar === undefined) out.KeyCar = raw.keyCar;
  if (raw.country !== undefined && out.Country === undefined) out.Country = raw.country;
  if (raw.epics !== undefined && out.Epics === undefined) out.Epics = raw.epics;

  // ObtainableVia (keep whatever you provide; can be string or string[])
  if (raw.obtainableVia !== undefined && out.ObtainableVia === undefined) {
    out.ObtainableVia = raw.obtainableVia;
  }

  // Added fields
  if (raw.added !== undefined && out.Added === undefined) out.Added = raw.added;
  if (raw.addedWith !== undefined && out.Added_With === undefined) out.Added_With = raw.addedWith;
  if (raw.addedDate !== undefined && out["Added date"] === undefined) out["Added date"] = raw.addedDate;

  // Totals
  if (raw.totalUpgradeCost !== undefined && out["Total upgrade cost"] === undefined) {
    out["Total upgrade cost"] = raw.totalUpgradeCost;
  }
  if (raw.totalGlPoints !== undefined && out["Total GL points"] === undefined) {
    out["Total GL points"] = raw.totalGlPoints;
  }

  // Blueprints
  if (raw.blueprints1Star !== undefined && out.BPs_1_Star === undefined) out.BPs_1_Star = raw.blueprints1Star;
  if (raw.blueprints2Star !== undefined && out.BPs_2_Star === undefined) out.BPs_2_Star = raw.blueprints2Star;
  if (raw.blueprints3Star !== undefined && out.BPs_3_Star === undefined) out.BPs_3_Star = raw.blueprints3Star;
  if (raw.blueprints4Star !== undefined && out.BPs_4_Star === undefined) out.BPs_4_Star = raw.blueprints4Star;
  if (raw.blueprints5Star !== undefined && out.BPs_5_Star === undefined) out.BPs_5_Star = raw.blueprints5Star;
  if (raw.blueprints6Star !== undefined && out.BPs_6_Star === undefined) out.BPs_6_Star = raw.blueprints6Star;

  // Garage + tags
  if (raw.garageLvl !== undefined && out.Garage_Lvl === undefined) out.Garage_Lvl = raw.garageLvl;
  if (raw.tags !== undefined && out.Tags === undefined) out.Tags = raw.tags;

  // Stats mapping new -> legacy (only if legacy missing)
  const stats: Array<[newKey: string, oldKey: string]> = [
    ["stockRank", "Stock_Rank"],
    ["stockTopSpeed", "Stock_Top_Speed"],
    ["stockAcceleration", "Stock_Acceleration"],
    ["stockHandling", "Stock_Handling"],
    ["stockNitro", "Stock_Nitro"],

    ["oneStarMaxRank", "One_Star_Max_Rank"],
    ["oneStarMaxTopSpeed", "One_Star_Max_Top_Speed"],
    ["oneStarMaxAcceleration", "One_Star_Max_Acceleration"],
    ["oneStarMaxHandling", "One_Star_Max_Handling"],
    ["oneStarMaxNitro", "One_Star_Max_Nitro"],

    ["twoStarMaxRank", "Two_Star_Max_Rank"],
    ["twoStarMaxTopSpeed", "Two_Star_Max_Top_Speed"],
    ["twoStarMaxAcceleration", "Two_Star_Max_Acceleration"],
    ["twoStarMaxHandling", "Two_Star_Max_Handling"],
    ["twoStarMaxNitro", "Two_Star_Max_Nitro"],

    ["threeStarMaxRank", "Three_Star_Max_Rank"],
    ["threeStarMaxTopSpeed", "Three_Star_Max_Top_Speed"],
    ["threeStarMaxAcceleration", "Three_Star_Max_Acceleration"],
    ["threeStarMaxHandling", "Three_Star_Max_Handling"],
    ["threeStarMaxNitro", "Three_Star_Max_Nitro"],

    ["fourStarMaxRank", "Four_Star_Max_Rank"],
    ["fourStarMaxTopSpeed", "Four_Star_Max_Top_Speed"],
    ["fourStarMaxAcceleration", "Four_Star_Max_Acceleration"],
    ["fourStarMaxHandling", "Four_Star_Max_Handling"],
    ["fourStarMaxNitro", "Four_Star_Max_Nitro"],

    ["fiveStarMaxRank", "Five_Star_Max_Rank"],
    ["fiveStarMaxTopSpeed", "Five_Star_Max_Top_Speed"],
    ["fiveStarMaxAcceleration", "Five_Star_Max_Acceleration"],
    ["fiveStarMaxHandling", "Five_Star_Max_Handling"],
    ["fiveStarMaxNitro", "Five_Star_Max_Nitro"],

    ["sixStarMaxRank", "Six_Star_Max_Rank"],
    ["sixStarMaxTopSpeed", "Six_Star_Max_Top_Speed"],
    ["sixStarMaxAcceleration", "Six_Star_Max_Acceleration"],
    ["sixStarMaxHandling", "Six_Star_Max_Handling"],
    ["sixStarMaxNitro", "Six_Star_Max_Nitro"],

    ["goldMaxRank", "Gold_Max_Rank"],
    ["goldTopSpeed", "Gold_Top_Speed"],
    ["goldAcceleration", "Gold_Acceleration"],
    ["goldHandling", "Gold_Handling"],
    ["goldNitro", "Gold_Nitro"],
  ];

  for (const [newKey, oldKey] of stats) {
    if (raw[newKey] !== undefined && out[oldKey] === undefined) out[oldKey] = raw[newKey];
  }

  return out as SeedCar;
}