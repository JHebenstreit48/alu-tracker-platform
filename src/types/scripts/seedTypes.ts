export type SeedStatus = "complete" | "in progress" | "missing" | "unknown";

export type SeedCar = {
  brand?: string;
  model?: string;
  class?: string;
  image?: string;
  normalizedKey?: string;

  rarity?: string;
  stars?: number;
  keyCar?: boolean;
  country?: string;
  epics?: number;
  obtainableVia?: string[] | string;

  added?: string;
  addedWith?: unknown;
  addedDate?: string;

  totalUpgradeCost?: number;
  totalGlPoints?: number;

  blueprints1Star?: number;
  blueprints2Star?: number;
  blueprints3Star?: number;
  blueprints4Star?: number;
  blueprints5Star?: number;
  blueprints6Star?: number;

  stockRank?: number;
  stockTopSpeed?: number;
  stockAcceleration?: number;
  stockHandling?: number;
  stockNitro?: number;

  oneStarMaxRank?: number;
  oneStarMaxTopSpeed?: number;
  oneStarMaxAcceleration?: number;
  oneStarMaxHandling?: number;
  oneStarMaxNitro?: number;

  twoStarMaxRank?: number;
  twoStarMaxTopSpeed?: number;
  twoStarMaxAcceleration?: number;
  twoStarMaxHandling?: number;
  twoStarMaxNitro?: number;

  threeStarMaxRank?: number;
  threeStarMaxTopSpeed?: number;
  threeStarMaxAcceleration?: number;
  threeStarMaxHandling?: number;
  threeStarMaxNitro?: number;

  fourStarMaxRank?: number;
  fourStarMaxTopSpeed?: number;
  fourStarMaxAcceleration?: number;
  fourStarMaxHandling?: number;
  fourStarMaxNitro?: number;

  fiveStarMaxRank?: number;
  fiveStarMaxTopSpeed?: number;
  fiveStarMaxAcceleration?: number;
  fiveStarMaxHandling?: number;
  fiveStarMaxNitro?: number;

  sixStarMaxRank?: number;
  sixStarMaxTopSpeed?: number;
  sixStarMaxAcceleration?: number;
  sixStarMaxHandling?: number;
  sixStarMaxNitro?: number;

  goldMaxRank?: number;
  goldTopSpeed?: number;
  goldAcceleration?: number;
  goldHandling?: number;
  goldNitro?: number;

  status?: SeedStatus | string;
  message?: string;
  sources?: string[] | string;

  tags?: unknown;

  [key: string]: unknown;
};

export type CarDoc = SeedCar & {
  brand: string;
  model: string;
  normalizedKey: string;
};

export type StatusDoc = {
  normalizedKey: string;
  brand: string;
  model: string;
  status: SeedStatus;
  message: string;
  sources: string[];
};

export const normalizeString = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

export const generateCarKey = (brand: string, model: string): string =>
  normalizeString(`${brand}_${model}`);

export const asArray = (x: unknown): SeedCar[] =>
  Array.isArray(x) ? (x as SeedCar[]) : x && typeof x === "object" ? [x as SeedCar] : [];

export const cleanStatus = (raw: unknown): SeedStatus => {
  if (raw == null) return "unknown";
  const s = String(raw).toLowerCase().replace(/_/g, " ").trim();
  return s === "complete" || s === "in progress" || s === "missing" || s === "unknown"
    ? (s as SeedStatus)
    : "unknown";
};