import { starNumToName } from '@/utils/scripts/maintenance/convertToNewFormat/fileHelpers';

export function buildDeltasImportsIndexTs(alias: string, stars: number): string {
  const lines: string[] = [];
  for (let i = 1; i <= stars; i++) {
    lines.push(`import ${starNumToName(i)} from "${alias}/deltas/imports/${i}star.json";`);
  }
  const keys = Array.from({ length: stars }, (_, i) => starNumToName(i + 1)).join(', ');
  lines.push('');
  lines.push(`export default { importDeltas: { ${keys} } };`);
  return lines.join('\n') + '\n';
}

export function buildDeltasStagesIndexTs(alias: string, stars: number): string {
  const lines: string[] = [];
  for (let i = 1; i <= stars; i++) {
    lines.push(`import ${starNumToName(i)} from "${alias}/deltas/stages/${i}star.json";`);
  }
  const keys = Array.from({ length: stars }, (_, i) => starNumToName(i + 1)).join(', ');
  lines.push('');
  lines.push(`export default { stageDeltas: { ${keys} } };`);
  return lines.join('\n') + '\n';
}

export function buildDeltasIndexTs(alias: string): string {
  return [
    `import importDeltas from "${alias}/deltas/imports";`,
    `import stageDeltas from "${alias}/deltas/stages";`,
    '',
    'export default { ...importDeltas, ...stageDeltas };',
    '',
  ].join('\n');
}

export function buildStatsStagesIndexTs(alias: string, stars: number): string {
  const lines: string[] = [];
  for (let i = 1; i <= stars; i++) {
    lines.push(`import ${starNumToName(i)} from "${alias}/stats/stages/${i}star.json";`);
  }
  const keys = Array.from({ length: stars }, (_, i) => starNumToName(i + 1)).join(', ');
  lines.push('');
  lines.push(`export default { stages: { ${keys} } };`);
  return lines.join('\n') + '\n';
}

export function buildStatsIndexTs(alias: string): string {
  return [
    `import stock from '${alias}/stats/stock.json';`,
    `import stages from '${alias}/stats/stages';`,
    `import maxStar from '${alias}/stats/maxStar.json';`,
    `import gold from '${alias}/stats/gold.json';`,
    '',
    'export default { ...stock, ...stages, maxStar, ...gold };',
    '',
  ].join('\n');
}

export function buildUpgradesImportsIndexTs(alias: string): string {
  return [
    `import costs from "${alias}/upgrades/imports/costs.json";`,
    `import garageLevelXp from "${alias}/upgrades/imports/garageLevelXp.json";`,
    `import requirements from "${alias}/upgrades/imports/requirements.json";`,
    '',
    'export default { imports: { costs, garageLevelXp, requirements } };',
    '',
  ].join('\n');
}

export function buildUpgradesIndexTs(alias: string): string {
  return [
    `import creditCosts from "${alias}/upgrades/creditCosts.json";`,
    `import garageLevelXp from "${alias}/upgrades/garageLevelXp.json";`,
    `import imports from "${alias}/upgrades/imports";`,
    `import progression from "${alias}/upgrades/progression.json";`,
    '',
    'export default { creditCosts, garageLevelXp, ...imports, progression };',
    '',
  ].join('\n');
}

export function buildRootIndexTs(alias: string): string {
  return [
    `import car from '${alias}/car.json';`,
    `import stats from '${alias}/stats';`,
    `import upgrades from '${alias}/upgrades';`,
    `import deltas from '${alias}/deltas';`,
    '',
    'export default {...car, ...stats, ...upgrades, ...deltas};',
    '',
  ].join('\n');
}