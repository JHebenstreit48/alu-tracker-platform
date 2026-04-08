import type { CarMeta } from "@/types/scripts/scaffoldCar/index";

const STAR_NAMES = [
  "oneStar", "twoStar", "threeStar",
  "fourStar", "fiveStar", "sixStar",
];

const STAR_FILES = [
  "1star", "2star", "3star",
  "4star", "5star", "6star",
];

const STAGE_CAPS: Record<number, Record<number, number>> = {
  3: { 1: 5, 2: 8,  3: 10 },
  4: { 1: 4, 2: 7,  3: 9,  4: 11 },
  5: { 1: 3, 2: 6,  3: 8,  4: 10, 5: 12 },
  6: { 1: 3, 2: 6,  3: 8,  4: 10, 5: 12, 6: 13 },
};

const DATA_FILES = new Set([
  "car.json",
  "stats/stock.json",
  "stats/gold.json",
  "stats/maxStar.json",
  "upgrades/creditCosts.json",
  "upgrades/garageLevelXp.json",
  "upgrades/imports/costs.json",
  "upgrades/imports/garageLevelXp.json",
  "upgrades/imports/requirements.json",
  "upgrades/progression.json",
]);

const STAR_DATA_PATTERN = /^(stats\/stages|deltas\/imports|deltas\/stages)\/\dstar\.json$/;

export function isDataFile(relPath: string): boolean {
  return DATA_FILES.has(relPath) || STAR_DATA_PATTERN.test(relPath);
}

export function isOutdated(relPath: string, content: string): boolean {
  const normalized = relPath.split("\\").join("/");

  if (normalized === "index.ts") {
    if (!/import deltas/.test(content)) return true;
    if (/import.*stages\.json/.test(content)) return true;
  }

  if (normalized === "stats/index.ts") {
    if (/stages\.json/.test(content)) return true;
  }

  if (normalized === "upgrades/index.ts") {
    if (!/creditCosts/.test(content)) return true;
    if (!/import imports/.test(content)) return true;
    if (!/progression/.test(content)) return true;
    if (/importPartsUpgrades/.test(content)) return true;
  }

  if (normalized === "deltas/index.ts") {
    if (!/importDeltas/.test(content)) return true;
    if (!/stageDeltas/.test(content)) return true;
  }

  if (/stages\/index\.ts$/.test(normalized)) {
    if (/stages\.json/.test(content)) return true;
  }

  return false;
}

function j(obj: unknown): string {
  return JSON.stringify(obj, null, 2) + "\n";
}

function getImportStages(caps: Record<number, number>): number[] {
  return Object.values(caps);
}

function stagesWithZero(maxStage: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = 1; i <= maxStage; i++) out[String(i)] = 0;
  return out;
}

function importsWithZero(stages: number[]): Record<string, { uncommon: number }> {
  const out: Record<string, { uncommon: number }> = {};
  for (const s of stages) out[String(s)] = { uncommon: 0 };
  return out;
}

function requirementsWithZero(stages: number[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const s of stages) {
    out[String(s)] = {
      uncommon: { topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 },
      rare:     { topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 },
      epic:     { topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 },
    };
  }
  return out;
}

function buildStageObjects(
  caps: Record<number, number>,
  stars: number
): Array<{ file: string; statsObjs: object[]; deltaObjs: object[] }> {
  const files = STAR_FILES.slice(0, stars);
  const result = [];
  let prevCap = 0;

  for (let i = 0; i < stars; i++) {
    const starCap = caps[i + 1];
    const statsObjs: object[] = [];
    const deltaObjs: object[] = [];

    for (let s = prevCap + 1; s <= starCap; s++) {
      statsObjs.push({
        stage: s,
        rank: 0,
        topSpeed: 0,
        acceleration: 0,
        handling: 0,
        nitro: 0,
      });
      deltaObjs.push({
        stage: s,
        rankByStat: { topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 },
        statByStat: { topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 },
      });
    }

    result.push({ file: files[i], statsObjs, deltaObjs });
    prevCap = starCap;
  }

  return result;
}

export function generateTemplates(meta: CarMeta): Record<string, string> {
  const { alias, stars } = meta;
  const caps = STAGE_CAPS[stars] ?? STAGE_CAPS[6];
  const maxStage = caps[stars];
  const importStageNums = getImportStages(caps);
  const starStageCaps: Record<string, number> = {};
  for (let i = 1; i <= stars; i++) starStageCaps[String(i)] = caps[i];

  const names = STAR_NAMES.slice(0, stars);
  const files = STAR_FILES.slice(0, stars);
  const templates: Record<string, string> = {};
  const stageGroups = buildStageObjects(caps, stars);

  // ── index.ts ──
  templates["index.ts"] =
    `import car from '${alias}/car.json';\n` +
    `import stats from '${alias}/stats';\n` +
    `import upgrades from '${alias}/upgrades';\n` +
    `import deltas from '${alias}/deltas';\n\n` +
    `export default {...car, ...stats, ...upgrades, ...deltas};\n`;

  // ── stats ──
  templates["stats/stock.json"] = j({ stock: { rank: 0, topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 } });
  templates["stats/gold.json"]  = j({ gold:  { rank: 0, topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 } });

  const maxStarObj: Record<string, unknown> = {};
  for (const n of names) maxStarObj[n] = { rank: 0, topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 };
  templates["stats/maxStar.json"] = j(maxStarObj);

  for (const { file, statsObjs } of stageGroups) {
    templates[`stats/stages/${file}.json`] = j(statsObjs);
  }

  const stagesImports = files.map((f, i) => `import ${names[i]} from "${alias}/stats/stages/${f}.json";`).join("\n");
  templates["stats/stages/index.ts"] =
    `${stagesImports}\n\nexport default { stages: { ${names.join(", ")} } };\n`;

  templates["stats/index.ts"] =
    `import stock from '${alias}/stats/stock.json';\n` +
    `import stages from '${alias}/stats/stages';\n` +
    `import maxStar from '${alias}/stats/maxStar.json';\n` +
    `import gold from '${alias}/stats/gold.json';\n\n` +
    `export default { ...stock, ...stages, maxStar, ...gold };\n`;

  // ── deltas ──
  for (const { file, deltaObjs } of stageGroups) {
    templates[`deltas/stages/${file}.json`] = j(deltaObjs);
  }

  for (let i = 0; i < stars; i++) {
    const stageCap = caps[i + 1];
    templates[`deltas/imports/${files[i]}.json`] = j([{
      stage: stageCap,
      rarity: "uncommon",
      rankByStat: { topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 },
      statByStat: { topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 },
    }]);
  }

  const deltasImportsIdx = files.map((f, i) => `import ${names[i]} from "${alias}/deltas/imports/${f}.json";`).join("\n");
  templates["deltas/imports/index.ts"] =
    `${deltasImportsIdx}\n\nexport default { importDeltas: { ${names.join(", ")} } };\n`;

  const deltasStagesIdx = files.map((f, i) => `import ${names[i]} from "${alias}/deltas/stages/${f}.json";`).join("\n");
  templates["deltas/stages/index.ts"] =
    `${deltasStagesIdx}\n\nexport default { stageDeltas: { ${names.join(", ")} } };\n`;

  templates["deltas/index.ts"] =
    `import importDeltas from "${alias}/deltas/imports";\n` +
    `import stageDeltas from "${alias}/deltas/stages";\n\n` +
    `export default { ...importDeltas, ...stageDeltas };\n`;

  // ── upgrades ──
  templates["upgrades/progression.json"] = j({ starStageCaps });
  templates["upgrades/creditCosts.json"]  = j({ perUpgradeByStage: stagesWithZero(maxStage) });
  templates["upgrades/garageLevelXp.json"] = j({ perUpgradeByStage: stagesWithZero(maxStage) });

  templates["upgrades/imports/costs.json"] =
    j({ perCardByStage: importsWithZero(importStageNums) });
  templates["upgrades/imports/garageLevelXp.json"] =
    j({ perCardByStage: importsWithZero(importStageNums) });
  templates["upgrades/imports/requirements.json"] =
    j({ incrementalByStage: requirementsWithZero(importStageNums) });

  const upImportsIdx =
    `import costs from "${alias}/upgrades/imports/costs.json";\n` +
    `import garageLevelXp from "${alias}/upgrades/imports/garageLevelXp.json";\n` +
    `import requirements from "${alias}/upgrades/imports/requirements.json";\n\n` +
    `export default { imports: { costs, garageLevelXp, requirements } };\n`;
  templates["upgrades/imports/index.ts"] = upImportsIdx;

  templates["upgrades/index.ts"] =
    `import creditCosts from '${alias}/upgrades/creditCosts.json';\n` +
    `import garageLevelXp from '${alias}/upgrades/garageLevelXp.json';\n` +
    `import imports from '${alias}/upgrades/imports';\n` +
    `import progression from '${alias}/upgrades/progression.json';\n\n` +
    `export default { creditCosts, garageLevelXp, ...imports, progression };\n`;

  return templates;
}