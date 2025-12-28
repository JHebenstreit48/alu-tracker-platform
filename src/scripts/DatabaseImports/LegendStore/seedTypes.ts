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