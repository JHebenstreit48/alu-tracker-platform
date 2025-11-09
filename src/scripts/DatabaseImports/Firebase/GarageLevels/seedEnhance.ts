import path from "path";
import { LevelSeed, LevelDoc, CarSeed } from "./seedTypes";

const sanitize = (s: string): string =>
  s
    .replace(/[\s']/g, "")
    .replace(/&/g, "and")
    .replace(/[^A-Za-z0-9_-]/g, "");

function buildImagePath(brand: string, filename: string): string {
  if (!filename) return "";

  // If it's already a full images path, trust it (covers your manual edits)
  if (filename.startsWith("/images/")) {
    return filename;
  }

  const letter = brand?.[0]?.toUpperCase() ?? "_";
  const folder = sanitize(brand);
  const file = filename.split("/").pop() || "";
  return `/images/cars/${letter}/${folder}/${file}`;
}

export function enhanceLevels(levels: LevelSeed[]): LevelDoc[] {
  return levels.map((lvl) => ({
    GarageLevelKey: Number(lvl.GarageLevelKey),
    xp: Number(lvl.xp),
    cars: (lvl.cars || []).map((car: CarSeed) => ({
      brand: String(car.brand),
      model: String(car.model),
      image: buildImagePath(String(car.brand), String(car.image)),
    })),
  }));
}

export const rel = (p: string): string => path.relative(process.cwd(), p);