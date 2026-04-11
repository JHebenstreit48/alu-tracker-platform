import type { CarDoc, StatusDoc } from '@/types/scripts/carData/seedTypes';

export type BrandBucket = {
  docs: CarDoc[];
  statuses: StatusDoc[];
  keys: Set<string>;
  _bestByKey: Map<string, CarDoc>;
  _bestPrioByKey: Map<string, number>;
  _dupSeen: number;
  _dupReplaced: number;
  _overwriteByKey: Map<string, boolean>;
};

export type BuildResult = {
  brandBuckets: Map<string, BrandBucket>;
  expectedFromSeeds: number;
};

export type BuildOptions = {
  onlyKeys?: Set<string>;
};

export type ApplyOptions = {
  onlyKeys?: Set<string>;
  disablePrune?: boolean;
};