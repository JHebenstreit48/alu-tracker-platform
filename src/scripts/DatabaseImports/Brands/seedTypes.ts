export type SeedBrand = {
  brand?: string;
  slug?: string;
  description?: string;
  logo?: string;
  country?: string[] | string;
  established?: number | string;
  headquarters?: string;
  primaryMarket?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
  resources?: {
    text: string;
    url: string;
  }[];
  [key: string]: unknown;
};

export type BrandDoc = {
  slug: string;
  brand: string;
  description: string;
  logo: string;
  country: string[];
  established: number;
  headquarters?: string;
  primaryMarket?: string;
  location: {
    lat: number;
    lng: number;
  };
  resources?: {
    text: string;
    url: string;
  }[];
};

export const toArray = (x: unknown): SeedBrand[] =>
  Array.isArray(x)
    ? (x as SeedBrand[])
    : x && typeof x === "object"
    ? [x as SeedBrand]
    : [];

const normalize = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

export const makeSlug = (rawSlug: string | undefined, brand: string): string => {
  const base = (rawSlug || brand).toString().trim();
  return normalize(base);
};