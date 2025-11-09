import path from "path";
import { LevelSeed, LevelDoc, CarSeed } from "./seedTypes";
import { PUBLIC_DIR } from "./seedConfig";

// Same logic as your Mongo script's buildImagePath
function buildImagePath(brand: string, filename: string): string {
  const brandInitial = brand.charAt(0).toUpperCase();
  return `/images/cars/${brandInitial}/${brand}/${filename}`;
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

// Tiny helper for prettier log output if desired
export const rel = (p: string): string => path.relative(process.cwd(), p);