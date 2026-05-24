import fs from 'fs';
import path from 'path';
import type { StarStatBlock, StageStat, DeltaEntry, CarPatch } from '@/types/scripts/approvedSubmissions';
import { STAR_KEY_TO_FILE } from './starKeyMap';
import { writeJson } from './fileUtils';
import { mergeStageEntries, mergeDeltaEntries } from './mergeUtils';

export function applyPatch(carFolder: string, normalizedKey: string, patch: CarPatch, dry: boolean): void {
  console.log(`\n  Applying merged patch to: ${normalizedKey}`);

  const carJsonPath = path.join(carFolder, 'car.json');
  const carJson = JSON.parse(fs.readFileSync(carJsonPath, 'utf-8')) as Record<string, unknown>;

  let carJsonChanged = false;
  const identityFields = ['brand', 'model', 'class', 'rarity', 'stars', 'country', 'keyCar'] as const;
  for (const field of identityFields) {
    if (patch[field] !== undefined) {
      carJson[field] = patch[field];
      carJsonChanged = true;
      console.log(`  → car.json: ${field} = ${String(patch[field])}`);
    }
  }
  if (carJsonChanged) writeJson(carJsonPath, carJson, dry);

  if (patch.stats?.blueprints) {
    const bp = patch.stats.blueprints;
    const bpMap: Record<string, string> = {
      oneStar: 'blueprints1Star',
      twoStar: 'blueprints2Star',
      threeStar: 'blueprints3Star',
      fourStar: 'blueprints4Star',
      fiveStar: 'blueprints5Star',
      sixStar: 'blueprints6Star',
    };
    let bpChanged = false;
    for (const [key, jsonKey] of Object.entries(bpMap)) {
      if (bp[key] !== undefined) {
        carJson[jsonKey] = bp[key];
        bpChanged = true;
        console.log(`  → car.json: ${jsonKey} = ${String(bp[key])}`);
      }
    }
    if (bpChanged) writeJson(carJsonPath, carJson, dry);
  }

  if (patch.stats?.stock) {
    const stockPath = path.join(carFolder, 'stats', 'stock.json');
    if (fs.existsSync(stockPath)) {
      const existing = JSON.parse(fs.readFileSync(stockPath, 'utf-8')) as { stock: StarStatBlock };
      const merged: StarStatBlock = { ...existing.stock };
      for (const [k, v] of Object.entries(patch.stats.stock)) {
        if (v !== undefined && v !== 0) (merged as Record<string, unknown>)[k] = v;
      }
      console.log(`  → stats/stock.json`);
      writeJson(stockPath, { stock: merged }, dry);
    } else {
      console.warn(`  ⚠ stats/stock.json not found for ${normalizedKey}`);
    }
  }

  if (patch.stats?.maxAtStar) {
    const maxStarPath = path.join(carFolder, 'stats', 'maxStar.json');
    const existing = fs.existsSync(maxStarPath)
      ? (JSON.parse(fs.readFileSync(maxStarPath, 'utf-8')) as Record<string, StarStatBlock>)
      : ({} as Record<string, StarStatBlock>);
    const starKeys = ['oneStar', 'twoStar', 'threeStar', 'fourStar', 'fiveStar', 'sixStar'] as const;
    for (const key of starKeys) {
      const incoming = patch.stats.maxAtStar[key];
      if (!incoming) continue;
      const existingBlock: StarStatBlock = existing[key] ?? {};
      const mergedBlock: StarStatBlock = { ...existingBlock };
      for (const [k, v] of Object.entries(incoming)) {
        if (v !== undefined && v !== 0) (mergedBlock as Record<string, unknown>)[k] = v;
      }
      existing[key] = mergedBlock;
      console.log(`  → stats/maxStar.json: ${key}`);
    }
    writeJson(maxStarPath, existing, dry);
  }

  if (patch.stats?.gold) {
    const goldPath = path.join(carFolder, 'stats', 'gold.json');
    if (fs.existsSync(goldPath)) {
      const existing = JSON.parse(fs.readFileSync(goldPath, 'utf-8')) as { gold: StarStatBlock };
      const merged: StarStatBlock = { ...existing.gold };
      for (const [k, v] of Object.entries(patch.stats.gold)) {
        if (v !== undefined && v !== 0) (merged as Record<string, unknown>)[k] = v;
      }
      console.log(`  → stats/gold.json`);
      writeJson(goldPath, { gold: merged }, dry);
    } else {
      console.warn(`  ⚠ stats/gold.json not found for ${normalizedKey}`);
    }
  }

  if (patch.stats?.stages) {
    for (const [starKey, incomingEntries] of Object.entries(patch.stats.stages)) {
      const fileName = STAR_KEY_TO_FILE[starKey];
      if (!fileName) continue;
      const filePath = path.join(carFolder, 'stats', 'stages', fileName);
      const existing: StageStat[] = fs.existsSync(filePath) ? (JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StageStat[]) : [];
      const merged = mergeStageEntries(existing, incomingEntries);
      console.log(`  → stats/stages/${fileName}`);
      writeJson(filePath, merged, dry);
    }
  }

  if (patch.stats?.creditCosts) {
    const creditCostsPath = path.join(carFolder, 'upgrades', 'creditCosts.json');
    if (fs.existsSync(creditCostsPath)) {
      const existing = JSON.parse(fs.readFileSync(creditCostsPath, 'utf-8')) as {
        perUpgradeByStage: Record<string, number>;
      };
      const merged = { ...existing.perUpgradeByStage };
      for (const [stageNum, v] of Object.entries(patch.stats.creditCosts)) {
        if (v !== undefined && v !== 0) merged[stageNum] = v;
      }
      console.log(`  → upgrades/creditCosts.json`);
      writeJson(creditCostsPath, { perUpgradeByStage: merged }, dry);
    } else {
      console.warn(`  ⚠ upgrades/creditCosts.json not found for ${normalizedKey}`);
    }
  }

  if (patch.stats?.garageLevelXp) {
    const garageLevelXpPath = path.join(carFolder, 'upgrades', 'garageLevelXp.json');
    if (fs.existsSync(garageLevelXpPath)) {
      const existing = JSON.parse(fs.readFileSync(garageLevelXpPath, 'utf-8')) as {
        perUpgradeByStage: Record<string, number>;
      };
      const merged = { ...existing.perUpgradeByStage };
      for (const [stageNum, v] of Object.entries(patch.stats.garageLevelXp)) {
        if (v !== undefined && v !== 0) merged[stageNum] = v;
      }
      console.log(`  → upgrades/garageLevelXp.json`);
      writeJson(garageLevelXpPath, { perUpgradeByStage: merged }, dry);
    } else {
      console.warn(`  ⚠ upgrades/garageLevelXp.json not found for ${normalizedKey}`);
    }
  }

  if (patch.stats?.stageDeltas) {
    for (const [starKey, incomingEntries] of Object.entries(patch.stats.stageDeltas)) {
      const fileName = STAR_KEY_TO_FILE[starKey];
      if (!fileName) continue;
      const filePath = path.join(carFolder, 'deltas', 'stages', fileName);
      const existing: DeltaEntry[] = fs.existsSync(filePath) ? (JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DeltaEntry[]) : [];
      const merged = mergeDeltaEntries(existing, incomingEntries, 'stages');
      console.log(`  → deltas/stages/${fileName}`);
      writeJson(filePath, merged, dry);
    }
  }

  if (patch.stats?.importDeltas) {
    for (const [starKey, incomingEntries] of Object.entries(patch.stats.importDeltas)) {
      const fileName = STAR_KEY_TO_FILE[starKey];
      if (!fileName) continue;
      const filePath = path.join(carFolder, 'deltas', 'imports', fileName);
      const existing: DeltaEntry[] = fs.existsSync(filePath) ? (JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DeltaEntry[]) : [];
      const merged = mergeDeltaEntries(existing, incomingEntries, 'imports');
      console.log(`  → deltas/imports/${fileName}`);
      writeJson(filePath, merged, dry);
    }
  }
}