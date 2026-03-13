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
};

// Uncomment and fill in once Trade Coin data structure is confirmed
// export type TradeCoinSeed = {
//   Class: string;
//   Brand: string;
//   Model: string;
//   GarageLevel?: number | null;
//   StarRank: number;
//   CarRarity: string;
//   TradeCoinCost: number;
//   DailyLimit: number;        // always 1 for now
// };

// export type TradeCoinDoc = {
//   Class: string;
//   Brand: string;
//   Model: string;
//   GarageLevel?: number;
//   StarRank: number;
//   CarRarity: string;
//   TradeCoinCost: number;
//   DailyLimit: number;
// };