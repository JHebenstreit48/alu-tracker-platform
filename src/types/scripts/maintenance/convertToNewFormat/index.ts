export type StarCount = 3 | 4 | 5 | 6;

export interface CarJsonData {
  id: number;
  brand: string;
  class: string;
  model: string;
  stars: number;
  normalizedKey?: string;
  gold?: unknown;
  stock?: unknown;
  maxStar?: unknown;
  [key: string]: unknown;
}

export interface ConvertOptions {
  dry: boolean;
}

export type FilterFn = (filePath: string, data: CarJsonData) => boolean;