export type StarCount = 3 | 4 | 5 | 6;

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