// Blueprint fields are kept modular
export interface BlueprintStats {
  BPs_1_Star?: number | string;
  BPs_2_Star?: number;
  BPs_3_Star?: number;
  BPs_4_Star?: number;
  BPs_5_Star?: number;
  BPs_6_Star?: number;
  Total_BPs?: number | null;
}

// The Car interface now includes blueprint fields directly
export interface Car extends BlueprintStats {
  _id?: string; // Optional for flexibility (MongoDB ID)
  Id: number;
  Brand: string;
  Model: string;
  Class: string;
  Stars: number;
  Max_Rank: number;
  Top_Speed: number | string;
  Acceleration: number | string;
  Handling: number | string;
  Nitro: number | string;
  Max_Stats_No_Epics?: number;
}

// Preserve all your modular stage/stat interfaces:
export interface StageOneStats {
  Stage_1_Top_Speed: number;
  Stage_1_Acceleration: number;
  Stage_1_Handling: number;
  Stage_1_Nitro: number;
}

export interface StageTwoStats {
  Stage_2_Top_Speed: number;
  Stage_2_Acceleration: number;
  Stage_2_Handling: number;
  Stage_2_Nitro: number;
}

export interface StageThreeStats {
  Stage_3_Top_Speed: number;
  Stage_3_Acceleration: number;
  Stage_3_Handling: number;
  Stage_3_Nitro: number;
}

export interface StageFourStats {
  Stage_4_Top_Speed: number;
  Stage_4_Acceleration: number;
  Stage_4_Handling: number;
  Stage_4_Nitro: number;
}

export interface StageFiveStats {
  Stage_5_Top_Speed: number;
  Stage_5_Acceleration: number;
  Stage_5_Handling: number;
  Stage_5_Nitro: number;
}

export interface StageSixStats {
  Stage_6_Top_Speed: number;
  Stage_6_Acceleration: number;
  Stage_6_Handling: number;
  Stage_6_Nitro: number;
}

export interface StageSevenStats {
  Stage_7_Top_Speed: number;
  Stage_7_Acceleration: number;
  Stage_7_Handling: number;
  Stage_7_Nitro: number;
}

export interface StageEightStats {
  Stage_8_Top_Speed: number;
  Stage_8_Acceleration: number;
  Stage_8_Handling: number;
  Stage_8_Nitro: number;
}

export interface StageNineStats {
  Stage_9_Top_Speed: number;
  Stage_9_Acceleration: number;
  Stage_9_Handling: number;
  Stage_9_Nitro: number;
}

export interface StageTenStats {
  Stage_10_Top_Speed: number;
  Stage_10_Acceleration: number;
  Stage_10_Handling: number;
  Stage_10_Nitro: number;
}

// Optional interfaces for stat tiers
export interface OneStarMaxStatsNoEpics {
  Top_Speed: number;
  Acceleration: number;
  Handling: number;
  Nitro: number;
}

export interface TwoStarMaxStatsNoEpics {
  Top_Speed: number;
  Acceleration: number;
  Handling: number;
  Nitro: number;
}

export interface ThreeStarMaxStatsNoEpics {
  Top_Speed: number;
  Acceleration: number;
  Handling: number;
  Nitro: number;
}

export interface FourStarMaxStatsNoEpics {
  Top_Speed: number;
  Acceleration: number;
  Handling: number;
  Nitro: number;
}

export interface FiveStarMaxStatsNoEpics {
  Top_Speed: number;
  Acceleration: number;
  Handling: number;
  Nitro: number;
}

export interface SixStarMaxStatsNoEpics {
  Top_Speed: number;
  Acceleration: number;
  Handling: number;
  Nitro: number;
}
