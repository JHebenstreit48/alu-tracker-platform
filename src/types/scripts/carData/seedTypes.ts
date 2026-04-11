export type SeedStatus = "complete" | "in progress" | "missing" | "unknown";

export type StarCount = 3 | 4 | 5 | 6;

export type StatLine = {
  rank?: number;
  topSpeed?: number;
  acceleration?: number;
  handling?: number;
  nitro?: number;
};

export type StarName =
  | "oneStar"
  | "twoStar"
  | "threeStar"
  | "fourStar"
  | "fiveStar"
  | "sixStar";

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
  stock?: { stock: StatLine };
  gold?: { gold: StatLine };
  maxStar?: Partial<Record<StarName, StatLine>>;
  stages?: Partial<Record<StarName, unknown[]>>;
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

export type SeedCarWithMeta = SeedCar & {
  __seedWasNewFormat?: boolean;
};

export type RemapResult = {
  car: SeedCar;
  wasNewFormat: boolean;
};