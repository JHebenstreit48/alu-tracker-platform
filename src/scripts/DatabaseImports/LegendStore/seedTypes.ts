export type BlueprintSeed = {
  Class: string;
  Brand: string;
  Model: string;
  GarageLevel?: number | null;
  StarRank: number;
  CarRarity: string;
  BlueprintPrices: number[];
};

export type BlueprintDoc = {
  Class: string;
  Brand: string;
  Model: string;
  GarageLevel?: number;
  StarRank: number;
  CarRarity: string;
  BlueprintPrices: number[];
  seededAt: string;
};

export type TradeCoinSeed = {
  Class: string;
  Brand: string;
  Model: string;
  GarageLevel?: number | null;
  StarRank: number;
  CarRarity: string;
  TradeCoinCost: number;
  DailyLimit: number;
};

export type TradeCoinDoc = {
  Class: string;
  Brand: string;
  Model: string;
  GarageLevel?: number;
  StarRank: number;
  CarRarity: string;
  TradeCoinCost: number;
  DailyLimit: number;
  seededAt: string;
};