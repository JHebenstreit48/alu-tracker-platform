import fs from 'fs';
import path from 'path';
import type { FilterFn } from '@/types/scripts/maintenance/convertToNewFormat';

export function isAlreadyConverted(flatJsonPath: string): boolean {
  const dir = path.dirname(flatJsonPath);
  const baseName = path.basename(flatJsonPath, '.json');
  const convertedCarJson = path.join(dir, baseName, 'car.json');
  return fs.existsSync(convertedCarJson);
}

export function isPartiallyConverted(carFolderPath: string): boolean {
  const hasCarJson = fs.existsSync(path.join(carFolderPath, 'car.json'));
  if (!hasCarJson) return false;
  const missingDeltas = !fs.existsSync(path.join(carFolderPath, 'deltas'));
  const missingStatsStages = !fs.existsSync(path.join(carFolderPath, 'stats', 'stages'));
  const missingUpgrades = !fs.existsSync(path.join(carFolderPath, 'upgrades'));
  return missingDeltas || missingStatsStages || missingUpgrades;
}

export function findCarJsonFiles(seedsRoot: string, filterFn: FilterFn): string[] {
  const results: string[] = [];

  function walk(dir: string): void {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch { return; }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'car.json') {
        if (isAlreadyConverted(fullPath)) continue;
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          if (
            typeof data.id !== 'undefined' &&
            typeof data.class !== 'undefined' &&
            typeof data.brand !== 'undefined' &&
            typeof data.model !== 'undefined' &&
            filterFn(fullPath, data)
          ) {
            results.push(fullPath);
          }
        } catch { /* skip unparseable */ }
      }
    }
  }

  walk(seedsRoot);
  return results;
}

export function findPartialCarFolders(seedsRoot: string, filterFn: FilterFn): string[] {
  const results: string[] = [];

  function walk(dir: string): void {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch { return; }

    const hasCarJson = entries.some((e) => e.isFile() && e.name === 'car.json');

    if (hasCarJson) {
      if (isPartiallyConverted(dir)) {
        const carJsonPath = path.join(dir, 'car.json');
        try {
          const data = JSON.parse(fs.readFileSync(carJsonPath, 'utf8'));
          if (
            typeof data.id !== 'undefined' &&
            typeof data.class !== 'undefined' &&
            typeof data.brand !== 'undefined' &&
            typeof data.model !== 'undefined' &&
            filterFn(carJsonPath, data)
          ) {
            results.push(carJsonPath);
          }
        } catch { /* skip unparseable */ }
      }
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) walk(path.join(dir, entry.name));
    }
  }

  walk(seedsRoot);
  return results;
}