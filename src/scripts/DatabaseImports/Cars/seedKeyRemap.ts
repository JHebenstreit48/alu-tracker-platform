import { SeedCar, generateCarKey } from "./seedTypes";
import { isCarFolderIndexTs, isTsCollector } from "./seedFs";

type AnyObj = Record<string, unknown>;

const STAT_MAP: Array<[oldKey: string, newKey: string]> = [
  ["Stock_Rank", "stockRank"],
  ["Stock_Top_Speed", "stockTopSpeed"],
  ["Stock_Acceleration", "stockAcceleration"],
  ["Stock_Handling", "stockHandling"],
  ["Stock_Nitro", "stockNitro"],

  ["One_Star_Max_Rank", "oneStarMaxRank"],
  ["One_Star_Max_Top_Speed", "oneStarMaxTopSpeed"],
  ["One_Star_Max_Acceleration", "oneStarMaxAcceleration"],
  ["One_Star_Max_Handling", "oneStarMaxHandling"],
  ["One_Star_Max_Nitro", "oneStarMaxNitro"],

  ["Two_Star_Max_Rank", "twoStarMaxRank"],
  ["Two_Star_Max_Top_Speed", "twoStarMaxTopSpeed"],
  ["Two_Star_Max_Acceleration", "twoStarMaxAcceleration"],
  ["Two_Star_Max_Handling", "twoStarMaxHandling"],
  ["Two_Star_Max_Nitro", "twoStarMaxNitro"],

  ["Three_Star_Max_Rank", "threeStarMaxRank"],
  ["Three_Star_Max_Top_Speed", "threeStarMaxTopSpeed"],
  ["Three_Star_Max_Acceleration", "threeStarMaxAcceleration"],
  ["Three_Star_Max_Handling", "threeStarMaxHandling"],
  ["Three_Star_Max_Nitro", "threeStarMaxNitro"],

  ["Four_Star_Max_Rank", "fourStarMaxRank"],
  ["Four_Star_Max_Top_Speed", "fourStarMaxTopSpeed"],
  ["Four_Star_Max_Acceleration", "fourStarMaxAcceleration"],
  ["Four_Star_Max_Handling", "fourStarMaxHandling"],
  ["Four_Star_Max_Nitro", "fourStarMaxNitro"],

  ["Five_Star_Max_Rank", "fiveStarMaxRank"],
  ["Five_Star_Max_Top_Speed", "fiveStarMaxTopSpeed"],
  ["Five_Star_Max_Acceleration", "fiveStarMaxAcceleration"],
  ["Five_Star_Max_Handling", "fiveStarMaxHandling"],
  ["Five_Star_Max_Nitro", "fiveStarMaxNitro"],

  ["Six_Star_Max_Rank", "sixStarMaxRank"],
  ["Six_Star_Max_Top_Speed", "sixStarMaxTopSpeed"],
  ["Six_Star_Max_Acceleration", "sixStarMaxAcceleration"],
  ["Six_Star_Max_Handling", "sixStarMaxHandling"],
  ["Six_Star_Max_Nitro", "sixStarMaxNitro"],

  ["Gold_Max_Rank", "goldMaxRank"],
  ["Gold_Top_Speed", "goldTopSpeed"],
  ["Gold_Acceleration", "goldAcceleration"],
  ["Gold_Handling", "goldHandling"],
  ["Gold_Nitro", "goldNitro"],
];

function asStr(v: unknown): string {
  return v == null ? "" : String(v);
}

export function asStringArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  const s = String(v).trim();
  return s ? [s] : [];
}

function inferSource(file: string): "folder" | "collector" | "json" {
  if (isCarFolderIndexTs(file) || /[/\\]index\.ts$/i.test(file)) return "folder";
  if (isTsCollector(file)) return "collector";
  return "json";
}

export function remapSeedCar(raw: AnyObj, file: string): SeedCar {
  // Core identity fields (support both old + new keys)
  const brand = asStr(raw.brand ?? raw.Brand).trim();
  const model = asStr(raw.model ?? raw.Model).trim();
  const klass = asStr(raw.class ?? raw.Class).trim();

  const normalizedKey =
    asStr(raw.normalizedKey).trim() ||
    (brand && model ? generateCarKey(brand, model) : "");

  const out: AnyObj = {
    id: raw.id ?? raw.Id,
    image: raw.image ?? raw.Image,
    class: klass,
    brand,
    model,
    normalizedKey,

    status: raw.status,
    message: raw.message,
    sources: raw.sources,

    rarity: raw.rarity ?? raw.Rarity,
    stars: raw.stars ?? raw.Stars,
    keyCar: raw.keyCar ?? raw.KeyCar,
    country: raw.country ?? raw.Country,

    epics: raw.epics ?? raw.Epics,
    obtainableVia: asStringArray(raw.obtainableVia ?? raw.ObtainableVia),

    added: raw.added ?? raw.Added,
    addedWith: raw.addedWith ?? raw.Added_With,
    addedDate: raw.addedDate ?? raw["Added date"],

    totalUpgradeCost: raw.totalUpgradeCost ?? raw["Total upgrade cost"],
    totalGlPoints:
      raw.totalGlPoints ??
      raw.totalGLPoints ??
      raw["Total GL points"],

    blueprints1Star: raw.blueprints1Star ?? raw.BPs_1_Star,
    blueprints2Star: raw.blueprints2Star ?? raw.BPs_2_Star,
    blueprints3Star: raw.blueprints3Star ?? raw.BPs_3_Star,
    blueprints4Star: raw.blueprints4Star ?? raw.BPs_4_Star,
    blueprints5Star: raw.blueprints5Star ?? raw.BPs_5_Star,
    blueprints6Star: raw.blueprints6Star ?? raw.BPs_6_Star,

    garageLvl: raw.garageLvl ?? raw.Garage_Lvl,
    tags: raw.tags ?? raw.Tags,

    __source: inferSource(file),
  };

  // Stats mapping old->new, while also accepting already-new keys
  for (const [oldKey, newKey] of STAT_MAP) {
    if (raw[newKey] !== undefined) out[newKey] = raw[newKey];
    else if (raw[oldKey] !== undefined) out[newKey] = raw[oldKey];
  }

  return out as SeedCar;
}