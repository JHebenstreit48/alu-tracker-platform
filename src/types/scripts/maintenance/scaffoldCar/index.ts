import type { StarCount } from '@/types/scripts/carData';

export type { StarCount };

export type ScaffoldArgs = {
  root: string;
  keys: Set<string>;
  all: boolean;
  dry: boolean;
  verbose: boolean;
  fix: boolean;
};

export type CarMeta = {
  normalizedKey: string;
  stars: StarCount;
  brand: string;
  klass: string;
  model: string;
  letter: string;
  alias: string;
};

export type ScaffoldResult = {
  key: string;
  created: number;
  fixed: number;
};