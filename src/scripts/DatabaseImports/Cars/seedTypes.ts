export type SeedCar = {
  Brand?: string;
  Model?: string;
  Image?: string;
  normalizedKey?: string;
  status?: string;
  message?: string;
  sources?: string[] | string;
  [key: string]: unknown;
};

export type CarDoc = SeedCar & {
  Brand: string;
  Model: string;
  normalizedKey: string;
  Image?: string;
};

export type StatusDoc = {
  normalizedKey: string;
  Brand: string;
  Model: string;
  status: "complete" | "in progress" | "missing" | "unknown";
  message: string;
  sources: string[];
};

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
  Array.isArray(x)
    ? (x as SeedCar[])
    : x && typeof x === "object"
    ? [x as SeedCar]
    : [];

export const cleanStatus = (raw: unknown): StatusDoc["status"] => {
  if (raw == null) return "unknown";
  const s = String(raw).toLowerCase().replace(/_/g, " ").trim();
  const allowed: StatusDoc["status"][] = [
    "complete",
    "in progress",
    "missing",
    "unknown",
  ];
  return (allowed.includes(s as StatusDoc["status"])
    ? s
    : "unknown") as StatusDoc["status"];
};