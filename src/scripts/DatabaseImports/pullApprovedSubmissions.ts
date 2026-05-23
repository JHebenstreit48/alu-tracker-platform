import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { adminDb } from '@/Firebase/firebaseAdmin';

const DRY = process.argv.includes('--dry');
const CARS_ROOT = path.resolve(__dirname, '../../seeds/cars');
const COLL = 'carSubmissions';

// ─── Types ────────────────────────────────────────────────────────────────

interface StarStatBlock {
  rank?: number;
  topSpeed?: number;
  acceleration?: number;
  handling?: number;
  nitro?: number;
}

interface StageStat {
  stage: number;
  rank?: number;
  topSpeed?: number;
  acceleration?: number;
  handling?: number;
  nitro?: number;
}

interface DeltaEntry {
  stage: number;
  rarity?: string;
  rankByStat?: Record<string, number>;
  statByStat?: Record<string, number>;
  cardsAppliedByStat?: Record<string, number>;
  statDeltaByStat?: Record<string, number>;
}

interface CarStatsPatch {
  stock?: StarStatBlock;
  maxAtStar?: {
    oneStar?: StarStatBlock;
    twoStar?: StarStatBlock;
    threeStar?: StarStatBlock;
    fourStar?: StarStatBlock;
    fiveStar?: StarStatBlock;
    sixStar?: StarStatBlock;
  };
  gold?: StarStatBlock;
  blueprints?: Record<string, unknown>;
  stages?: Record<string, StageStat[]>;
  creditCosts?: Record<string, number>;
  garageLevelXp?: Record<string, number>;
  stageDeltas?: Record<string, DeltaEntry[]>;
  importDeltas?: Record<string, DeltaEntry[]>;
}

interface CarPatch {
  brand?: string;
  model?: string;
  class?: string;
  rarity?: string;
  stars?: number;
  country?: string;
  keyCar?: boolean;
  stats?: CarStatsPatch;
}

interface Submission {
  id: string;
  cars: Record<string, CarPatch>;
  submitterUsername: string;
  submitterNote?: string;
  status: string;
}

// ─── Star key map ─────────────────────────────────────────────────────────

const STAR_KEY_TO_FILE: Record<string, string> = {
  oneStar: '1star.json',
  twoStar: '2star.json',
  threeStar: '3star.json',
  fourStar: '4star.json',
  fiveStar: '5star.json',
  sixStar: '6star.json',
};

// ─── Find car folder by normalizedKey ─────────────────────────────────────

function findCarFolder(normalizedKey: string): string | null {
  const letters = fs.readdirSync(CARS_ROOT);
  for (const letter of letters) {
    const letterPath = path.join(CARS_ROOT, letter);
    if (!fs.statSync(letterPath).isDirectory()) continue;
    const brands = fs.readdirSync(letterPath);
    for (const brand of brands) {
      const brandPath = path.join(letterPath, brand);
      if (!fs.statSync(brandPath).isDirectory()) continue;
      const classes = fs.readdirSync(brandPath);
      for (const cls of classes) {
        const clsPath = path.join(brandPath, cls);
        if (!fs.statSync(clsPath).isDirectory()) continue;
        const models = fs.readdirSync(clsPath);
        for (const model of models) {
          const carPath = path.join(clsPath, model);
          const carJsonPath = path.join(carPath, 'car.json');
          if (!fs.existsSync(carJsonPath)) continue;
          try {
            const carJson = JSON.parse(fs.readFileSync(carJsonPath, 'utf-8'));
            if (carJson.normalizedKey === normalizedKey) return carPath;
          } catch {
            // skip malformed car.json
          }
        }
      }
    }
  }
  return null;
}

// ─── Write JSON helper ─────────────────────────────────────────────────────

function writeJson(filePath: string, data: unknown) {
  if (DRY) {
    console.log(`  [DRY] Would write: ${filePath}`);
    console.log(`  ${JSON.stringify(data, null, 2).slice(0, 300)}...`);
    return;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  ✓ Written: ${filePath}`);
}

// ─── Merge stage stat entries ──────────────────────────────────────────────

function mergeStageEntries(existing: StageStat[], incoming: StageStat[]): StageStat[] {
  const result = [...existing];
  for (const incomingEntry of incoming) {
    const existingIdx = result.findIndex((e) => e.stage === incomingEntry.stage);
    const mergedEntry: StageStat = existingIdx >= 0 ? { ...result[existingIdx] } : { stage: incomingEntry.stage };

    const fields: (keyof Omit<StageStat, 'stage'>)[] = ['rank', 'topSpeed', 'acceleration', 'handling', 'nitro'];
    for (const field of fields) {
      const v = incomingEntry[field];
      if (v !== undefined && v !== 0) (mergedEntry as any)[field] = v;
    }

    if (existingIdx >= 0) result[existingIdx] = mergedEntry;
    else result.push(mergedEntry);
  }
  result.sort((a, b) => a.stage - b.stage);
  return result;
}

// ─── Merge delta entries ───────────────────────────────────────────────────

function mergeDeltaEntries(existing: DeltaEntry[], incoming: DeltaEntry[], type: 'stages' | 'imports'): DeltaEntry[] {
  const result = [...existing];
  for (const incomingEntry of incoming) {
    const existingIdx =
      type === 'imports'
        ? result.findIndex((e) => e.stage === incomingEntry.stage && e.rarity === incomingEntry.rarity)
        : result.findIndex((e) => e.stage === incomingEntry.stage);

    const mergedEntry: DeltaEntry =
      existingIdx >= 0
        ? { ...result[existingIdx] }
        : { stage: incomingEntry.stage, ...(incomingEntry.rarity ? { rarity: incomingEntry.rarity } : {}) };

    if (type === 'stages') {
      if (incomingEntry.rankByStat) {
        mergedEntry.rankByStat = { ...(mergedEntry.rankByStat ?? {}) };
        for (const [k, v] of Object.entries(incomingEntry.rankByStat)) {
          if (v !== undefined && v !== 0) mergedEntry.rankByStat[k] = v;
        }
      }
      if (incomingEntry.statByStat) {
        mergedEntry.statByStat = { ...(mergedEntry.statByStat ?? {}) };
        for (const [k, v] of Object.entries(incomingEntry.statByStat)) {
          if (v !== undefined && v !== 0) mergedEntry.statByStat[k] = v;
        }
      }
    } else {
      if (incomingEntry.cardsAppliedByStat) {
        mergedEntry.cardsAppliedByStat = { ...(mergedEntry.cardsAppliedByStat ?? {}) };
        for (const [k, v] of Object.entries(incomingEntry.cardsAppliedByStat)) {
          if (v !== undefined && v !== 0) mergedEntry.cardsAppliedByStat[k] = v;
        }
      }
      if (incomingEntry.statDeltaByStat) {
        mergedEntry.statDeltaByStat = { ...(mergedEntry.statDeltaByStat ?? {}) };
        for (const [k, v] of Object.entries(incomingEntry.statDeltaByStat)) {
          if (v !== undefined && v !== 0) mergedEntry.statDeltaByStat[k] = v;
        }
      }
    }

    if (existingIdx >= 0) result[existingIdx] = mergedEntry;
    else result.push(mergedEntry);
  }
  result.sort((a, b) => a.stage - b.stage);
  return result;
}

// ─── Deep merge two CarPatch objects ──────────────────────────────────────

function mergePatch(base: CarPatch, incoming: CarPatch): CarPatch {
  const merged: CarPatch = { ...base };

  const identityFields = ['brand', 'model', 'class', 'rarity', 'stars', 'country', 'keyCar'] as const;
  for (const field of identityFields) {
    if (incoming[field] !== undefined) (merged as any)[field] = incoming[field];
  }

  if (incoming.stats) {
    merged.stats = merged.stats || {};
    if (incoming.stats.stock) merged.stats.stock = { ...(merged.stats.stock || {}), ...incoming.stats.stock };
    if (incoming.stats.gold) merged.stats.gold = { ...(merged.stats.gold || {}), ...incoming.stats.gold };
    if (incoming.stats.maxAtStar) {
      merged.stats.maxAtStar = merged.stats.maxAtStar || {};
      const starKeys = ['oneStar', 'twoStar', 'threeStar', 'fourStar', 'fiveStar', 'sixStar'] as const;
      for (const key of starKeys) {
        if (incoming.stats.maxAtStar[key]) {
          merged.stats.maxAtStar[key] = { ...(merged.stats.maxAtStar[key] || {}), ...incoming.stats.maxAtStar[key] };
        }
      }
    }
    if (incoming.stats.blueprints) merged.stats.blueprints = { ...(merged.stats.blueprints || {}), ...incoming.stats.blueprints };
    if (incoming.stats.stages) merged.stats.stages = { ...(merged.stats.stages || {}), ...incoming.stats.stages };
    if (incoming.stats.creditCosts) merged.stats.creditCosts = { ...(merged.stats.creditCosts || {}), ...incoming.stats.creditCosts };
    if (incoming.stats.garageLevelXp) merged.stats.garageLevelXp = { ...(merged.stats.garageLevelXp || {}), ...incoming.stats.garageLevelXp };
    if (incoming.stats.stageDeltas) merged.stats.stageDeltas = { ...(merged.stats.stageDeltas || {}), ...incoming.stats.stageDeltas };
    if (incoming.stats.importDeltas) merged.stats.importDeltas = { ...(merged.stats.importDeltas || {}), ...incoming.stats.importDeltas };
  }

  return merged;
}

// ─── Apply merged patch to car files ──────────────────────────────────────

function applyPatch(carFolder: string, normalizedKey: string, patch: CarPatch) {
  console.log(`\n  Applying merged patch to: ${normalizedKey}`);

  const carJsonPath = path.join(carFolder, 'car.json');
  const carJson = JSON.parse(fs.readFileSync(carJsonPath, 'utf-8'));

  let carJsonChanged = false;
  const identityFields = ['brand', 'model', 'class', 'rarity', 'stars', 'country', 'keyCar'] as const;
  for (const field of identityFields) {
    if (patch[field] !== undefined) {
      carJson[field] = patch[field];
      carJsonChanged = true;
      console.log(`  → car.json: ${field} = ${patch[field]}`);
    }
  }
  if (carJsonChanged) writeJson(carJsonPath, carJson);

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
        console.log(`  → car.json: ${jsonKey} = ${bp[key]}`);
      }
    }
    if (bpChanged) writeJson(carJsonPath, carJson);
  }

  if (patch.stats?.stock) {
    const stockPath = path.join(carFolder, 'stats', 'stock.json');
    if (fs.existsSync(stockPath)) {
      const existing = JSON.parse(fs.readFileSync(stockPath, 'utf-8'));
      const merged: StarStatBlock = { ...existing.stock };
      for (const [k, v] of Object.entries(patch.stats.stock)) {
        if (v !== undefined && v !== 0) (merged as any)[k] = v;
      }
      console.log(`  → stats/stock.json`);
      writeJson(stockPath, { stock: merged });
    } else {
      console.warn(`  ⚠ stats/stock.json not found for ${normalizedKey}`);
    }
  }

  if (patch.stats?.maxAtStar) {
    const maxStarPath = path.join(carFolder, 'stats', 'maxStar.json');
    const existing = fs.existsSync(maxStarPath) ? JSON.parse(fs.readFileSync(maxStarPath, 'utf-8')) : {};
    const starKeys = ['oneStar', 'twoStar', 'threeStar', 'fourStar', 'fiveStar', 'sixStar'] as const;
    for (const key of starKeys) {
      const incoming = patch.stats.maxAtStar[key];
      if (!incoming) continue;
      const existingBlock = existing[key] || {};
      const mergedBlock: StarStatBlock = { ...existingBlock };
      for (const [k, v] of Object.entries(incoming)) {
        if (v !== undefined && v !== 0) (mergedBlock as any)[k] = v;
      }
      existing[key] = mergedBlock;
      console.log(`  → stats/maxStar.json: ${key}`);
    }
    writeJson(maxStarPath, existing);
  }

  if (patch.stats?.gold) {
    const goldPath = path.join(carFolder, 'stats', 'gold.json');
    if (fs.existsSync(goldPath)) {
      const existing = JSON.parse(fs.readFileSync(goldPath, 'utf-8'));
      const merged: StarStatBlock = { ...existing.gold };
      for (const [k, v] of Object.entries(patch.stats.gold)) {
        if (v !== undefined && v !== 0) (merged as any)[k] = v;
      }
      console.log(`  → stats/gold.json`);
      writeJson(goldPath, { gold: merged });
    } else {
      console.warn(`  ⚠ stats/gold.json not found for ${normalizedKey}`);
    }
  }

  // --- stats/stages/*.json ---
  if (patch.stats?.stages) {
    for (const [starKey, incomingEntries] of Object.entries(patch.stats.stages)) {
      const fileName = STAR_KEY_TO_FILE[starKey];
      if (!fileName) continue;
      const filePath = path.join(carFolder, 'stats', 'stages', fileName);
      const existing: StageStat[] = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : [];
      const merged = mergeStageEntries(existing, incomingEntries);
      console.log(`  → stats/stages/${fileName}`);
      writeJson(filePath, merged);
    }
  }

  // --- upgrades/creditCosts.json ---
  if (patch.stats?.creditCosts) {
    const creditCostsPath = path.join(carFolder, 'upgrades', 'creditCosts.json');
    if (fs.existsSync(creditCostsPath)) {
      const existing = JSON.parse(fs.readFileSync(creditCostsPath, 'utf-8'));
      const merged = { ...existing.perUpgradeByStage };
      for (const [stageNum, v] of Object.entries(patch.stats.creditCosts)) {
        if (v !== undefined && v !== 0) merged[stageNum] = v;
      }
      console.log(`  → upgrades/creditCosts.json`);
      writeJson(creditCostsPath, { perUpgradeByStage: merged });
    } else {
      console.warn(`  ⚠ upgrades/creditCosts.json not found for ${normalizedKey}`);
    }
  }

  // --- upgrades/garageLevelXp.json ---
  if (patch.stats?.garageLevelXp) {
    const garageLevelXpPath = path.join(carFolder, 'upgrades', 'garageLevelXp.json');
    if (fs.existsSync(garageLevelXpPath)) {
      const existing = JSON.parse(fs.readFileSync(garageLevelXpPath, 'utf-8'));
      const merged = { ...existing.perUpgradeByStage };
      for (const [stageNum, v] of Object.entries(patch.stats.garageLevelXp)) {
        if (v !== undefined && v !== 0) merged[stageNum] = v;
      }
      console.log(`  → upgrades/garageLevelXp.json`);
      writeJson(garageLevelXpPath, { perUpgradeByStage: merged });
    } else {
      console.warn(`  ⚠ upgrades/garageLevelXp.json not found for ${normalizedKey}`);
    }
  }

  // --- deltas/stages/*.json ---
  if (patch.stats?.stageDeltas) {
    for (const [starKey, incomingEntries] of Object.entries(patch.stats.stageDeltas)) {
      const fileName = STAR_KEY_TO_FILE[starKey];
      if (!fileName) continue;
      const filePath = path.join(carFolder, 'deltas', 'stages', fileName);
      const existing: DeltaEntry[] = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : [];
      const merged = mergeDeltaEntries(existing, incomingEntries, 'stages');
      console.log(`  → deltas/stages/${fileName}`);
      writeJson(filePath, merged);
    }
  }

  // --- deltas/imports/*.json ---
  if (patch.stats?.importDeltas) {
    for (const [starKey, incomingEntries] of Object.entries(patch.stats.importDeltas)) {
      const fileName = STAR_KEY_TO_FILE[starKey];
      if (!fileName) continue;
      const filePath = path.join(carFolder, 'deltas', 'imports', fileName);
      const existing: DeltaEntry[] = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : [];
      const merged = mergeDeltaEntries(existing, incomingEntries, 'imports');
      console.log(`  → deltas/imports/${fileName}`);
      writeJson(filePath, merged);
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n──────────────────────────────────────────────────');
  console.log(`  Pull Approved Submissions ${DRY ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('──────────────────────────────────────────────────\n');

  const snap = await adminDb.collection(COLL).where('status', '==', 'approved').get();

  if (snap.empty) {
    console.log('  No approved submissions found.');
    console.log('\n──────────────────────────────────────────────────\n');
    return;
  }

  console.log(`  Found ${snap.docs.length} approved submission(s)\n`);

  const mergedPatches: Record<string, CarPatch> = {};
  const submissionMeta: { id: string; username: string; note?: string }[] = [];

  for (const doc of snap.docs) {
    const submission = { id: doc.id, ...doc.data() } as Submission;
    submissionMeta.push({
      id: submission.id,
      username: submission.submitterUsername,
      note: submission.submitterNote,
    });

    console.log(`● Submission: ${submission.id}`);
    console.log(`  By: ${submission.submitterUsername}`);
    console.log(`  Cars: ${Object.keys(submission.cars).join(', ')}`);
    if (submission.submitterNote) console.log(`  Note: ${submission.submitterNote}`);

    for (const [normalizedKey, patch] of Object.entries(submission.cars)) {
      if (!mergedPatches[normalizedKey]) mergedPatches[normalizedKey] = {};
      mergedPatches[normalizedKey] = mergePatch(mergedPatches[normalizedKey], patch);
    }
  }

  console.log(`\n  Merged into ${Object.keys(mergedPatches).length} unique car(s) to update\n`);

  let applied = 0;
  let notFound = 0;

  for (const [normalizedKey, patch] of Object.entries(mergedPatches)) {
    const carFolder = findCarFolder(normalizedKey);
    if (!carFolder) {
      console.warn(`  ⚠ Car not found for normalizedKey: ${normalizedKey}`);
      notFound++;
      continue;
    }
    applyPatch(carFolder, normalizedKey, patch);
    applied++;
  }

  for (const meta of submissionMeta) {
    if (!DRY) {
      await adminDb.collection(COLL).doc(meta.id).update({
        status: 'imported',
        importedAt: new Date().toISOString(),
      });
      console.log(`\n  ✓ Marked as imported: ${meta.id}`);
    } else {
      console.log(`\n  [DRY] Would mark as imported: ${meta.id}`);
    }
  }

  console.log('\n──────────────────────────────────────────────────');
  console.log(`  Cars applied  : ${applied}`);
  console.log(`  Cars not found: ${notFound}`);
  if (DRY) console.log('\n  Run without --dry to apply changes.');
  console.log('──────────────────────────────────────────────────\n');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});