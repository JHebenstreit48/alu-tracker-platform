import type { StarCount } from '@/types/scripts/carData';

export type { StarCount };

export type RepairArgs = {
  root: string;
  keys: Set<string>;
  all: boolean;
  dry: boolean;
  verbose: boolean;
  report: boolean;
  brand?: string;
  letter?: string;
};

export type RepairResult = {
  key: string;
  fixed: number;
  skipped: number;
  issues: string[];
};

export type StageRange = {
  starRank: number;
  from: number;
  to: number;
};