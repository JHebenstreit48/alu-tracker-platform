import type { StarStatBlock, StageStat, DeltaEntry, CarPatch } from '@/types/scripts/approvedSubmissions';

export function mergeStageEntries(existing: StageStat[], incoming: StageStat[]): StageStat[] {
  const result = [...existing];
  for (const incomingEntry of incoming) {
    const existingIdx = result.findIndex((e) => e.stage === incomingEntry.stage);
    const mergedEntry: StageStat = existingIdx >= 0 ? { ...result[existingIdx] } : { stage: incomingEntry.stage };

    const fields: (keyof Omit<StageStat, 'stage'>)[] = ['rank', 'topSpeed', 'acceleration', 'handling', 'nitro'];
    for (const field of fields) {
      const v = incomingEntry[field];
      if (v !== undefined && v !== 0) (mergedEntry as unknown as Record<string, unknown>)[field] = v;
    }

    if (existingIdx >= 0) result[existingIdx] = mergedEntry;
    else result.push(mergedEntry);
  }
  result.sort((a, b) => a.stage - b.stage);
  return result;
}

export function mergeDeltaEntries(existing: DeltaEntry[], incoming: DeltaEntry[], type: 'stages' | 'imports'): DeltaEntry[] {
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

export function mergePatch(base: CarPatch, incoming: CarPatch): CarPatch {
  const merged: CarPatch = { ...base };

  const identityFields = ['brand', 'model', 'class', 'rarity', 'stars', 'country', 'keyCar'] as const;
  for (const field of identityFields) {
    if (incoming[field] !== undefined) (merged as unknown as Record<string, unknown>)[field] = incoming[field];
  }

  if (incoming.stats) {
    merged.stats = merged.stats ?? {};
    if (incoming.stats.stock) merged.stats.stock = { ...(merged.stats.stock ?? {}), ...incoming.stats.stock };
    if (incoming.stats.gold) merged.stats.gold = { ...(merged.stats.gold ?? {}), ...incoming.stats.gold };
    if (incoming.stats.maxAtStar) {
      merged.stats.maxAtStar = merged.stats.maxAtStar ?? {};
      const starKeys = ['oneStar', 'twoStar', 'threeStar', 'fourStar', 'fiveStar', 'sixStar'] as const;
      for (const key of starKeys) {
        if (incoming.stats.maxAtStar[key]) {
          merged.stats.maxAtStar[key] = {
            ...(merged.stats.maxAtStar[key] ?? {}),
            ...incoming.stats.maxAtStar[key],
          } as StarStatBlock;
        }
      }
    }
    if (incoming.stats.blueprints) merged.stats.blueprints = { ...(merged.stats.blueprints ?? {}), ...incoming.stats.blueprints };
    if (incoming.stats.stages) merged.stats.stages = { ...(merged.stats.stages ?? {}), ...incoming.stats.stages };
    if (incoming.stats.creditCosts) merged.stats.creditCosts = { ...(merged.stats.creditCosts ?? {}), ...incoming.stats.creditCosts };
    if (incoming.stats.garageLevelXp) merged.stats.garageLevelXp = { ...(merged.stats.garageLevelXp ?? {}), ...incoming.stats.garageLevelXp };
    if (incoming.stats.stageDeltas) merged.stats.stageDeltas = { ...(merged.stats.stageDeltas ?? {}), ...incoming.stats.stageDeltas };
    if (incoming.stats.importDeltas) merged.stats.importDeltas = { ...(merged.stats.importDeltas ?? {}), ...incoming.stats.importDeltas };
  }

  return merged;
}