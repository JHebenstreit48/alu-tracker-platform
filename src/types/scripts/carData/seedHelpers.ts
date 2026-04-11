import type { SeedCar, SeedStatus } from '@/types/scripts/carData/seedTypes';

export const normalizeString = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

export const generateCarKey = (brand: string, model: string): string =>
  normalizeString(`${brand}_${model}`);

export const asArray = (x: unknown): SeedCar[] =>
  Array.isArray(x) ? (x as SeedCar[]) : x && typeof x === "object" ? [x as SeedCar] : [];

export const cleanStatus = (raw: unknown): SeedStatus => {
  if (raw == null) return "unknown";
  const s = String(raw).toLowerCase().replace(/_/g, " ").trim();
  return s === "complete" || s === "in progress" || s === "missing" || s === "unknown"
    ? (s as SeedStatus)
    : "unknown";
};