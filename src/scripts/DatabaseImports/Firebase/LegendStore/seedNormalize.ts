import type { BlueprintSeed, BlueprintDoc } from "./seedTypes";

const normalize = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export function toBlueprintDoc(seed: BlueprintSeed): {
  id: string;
  doc: BlueprintDoc;
} {
  const Class = String(seed.Class).trim();
  const Brand = String(seed.Brand).trim();
  const Model = String(seed.Model).trim();
  const StarRank = Number(seed.StarRank);

  const id = [
    "ls",
    Class || "x",
    normalize(Brand),
    normalize(Model),
    StarRank || 0,
  ].join("_");

  const BlueprintPrices = Array.isArray(seed.BlueprintPrices)
    ? seed.BlueprintPrices.map((n) => Number(n))
    : [];

  const doc: BlueprintDoc = {
    Class,
    Brand,
    Model,
    StarRank,
    CarRarity: String(seed.CarRarity).trim(),
    BlueprintPrices,
  };

  if (seed.GarageLevel != null) {
    doc.GarageLevel = Number(seed.GarageLevel);
  }

  return { id, doc };
}