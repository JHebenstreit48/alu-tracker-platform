export interface StarStatBlock {
  rank?: number;
  topSpeed?: number;
  acceleration?: number;
  handling?: number;
  nitro?: number;
}

export interface StageStat {
  stage: number;
  rank?: number;
  topSpeed?: number;
  acceleration?: number;
  handling?: number;
  nitro?: number;
}

export interface DeltaEntry {
  stage: number;
  rarity?: string;
  rankByStat?: Record<string, number>;
  statByStat?: Record<string, number>;
  cardsAppliedByStat?: Record<string, number>;
  statDeltaByStat?: Record<string, number>;
}

export interface CarStatsPatch {
  stock?: StarStatBlock;
  maxAtStar?: {
    oneStar?: StarStatBlock;
    twoStar?: StarStatBlock;
    threeStar?: StarStatBlock;
    fourStar?: StarStatBlock;
    fiveStar?: StarStatBlock;
    sixStar?: StarStatBlock;
  };
  gold?: StarStatBlock;
  blueprints?: Record<string, unknown>;
  stages?: Record<string, StageStat[]>;
  creditCosts?: Record<string, number>;
  garageLevelXp?: Record<string, number>;
  stageDeltas?: Record<string, DeltaEntry[]>;
  importDeltas?: Record<string, DeltaEntry[]>;
}

export interface CarPatch {
  brand?: string;
  model?: string;
  class?: string;
  rarity?: string;
  stars?: number;
  country?: string;
  keyCar?: boolean;
  stats?: CarStatsPatch;
}

export interface Submission {
  id: string;
  cars: Record<string, CarPatch>;
  submitterUsername: string;
  submitterNote?: string;
  status: string;
}