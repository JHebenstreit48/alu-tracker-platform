import fs from 'fs';
import path from 'path';

const SEEDS_ROOT = path.join(__dirname, '../../seeds/cars');

const STAR_NAMES = ['oneStar', 'twoStar', 'threeStar', 'fourStar', 'fiveStar', 'sixStar'];

const STAGE_CAPS: Record<number, Record<number, number>> = {
  3: { 1: 5, 2: 8, 3: 10 },
  4: { 1: 4, 2: 7, 3: 9, 4: 11 },
  5: { 1: 3, 2: 6, 3: 8, 4: 10, 5: 12 },
  6: { 1: 3, 2: 6, 3: 8, 4: 10, 5: 12, 6: 13 },
};

function getArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function writeTs(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function starNumToName(n: number): string {
  return STAR_NAMES[n - 1];
}

function emptyStatBlock(): Record<string, number> {
  return { rank: 0, topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 };
}

function isStatBlock(val: unknown): val is Record<string, number> {
  return (
    val !== null &&
    typeof val === 'object' &&
    'rank' in (val as object)
  );
}

function buildMaxStar(stars: number): Record<string, unknown> {
  if (stars === 3) {
    return {
      oneStar: emptyStatBlock(),
      twoStar: emptyStatBlock(),
    };
  }

  const result: Record<string, unknown> = {};
  for (let i = 1; i <= stars; i++) {
    result[starNumToName(i)] = emptyStatBlock();
  }
  return result;
}

function buildProgressionCaps(stars: number): Record<string, number> {
  const caps = STAGE_CAPS[stars];
  if (!caps) return {};
  const result: Record<string, number> = {};
  for (const [star, cap] of Object.entries(caps)) {
    result[star] = cap;
  }
  return result;
}

function getAlias(letterFolder: string, brand: string, carClass: string, carFolder: string): string {
  return `@/seeds/cars/${letterFolder}/${brand}/${carClass}/${carFolder}`;
}

function buildDeltasImportsIndexTs(alias: string, stars: number): string {
  const lines: string[] = [];
  for (let i = 1; i <= stars; i++) {
    lines.push(`import ${starNumToName(i)} from "${alias}/deltas/imports/${i}star.json";`);
  }
  const keys = Array.from({ length: stars }, (_, i) => starNumToName(i + 1)).join(', ');
  lines.push('');
  lines.push(`export default { importDeltas: { ${keys} } };`);
  return lines.join('\n') + '\n';
}

function buildDeltasStagesIndexTs(alias: string, stars: number): string {
  const lines: string[] = [];
  for (let i = 1; i <= stars; i++) {
    lines.push(`import ${starNumToName(i)} from "${alias}/deltas/stages/${i}star.json";`);
  }
  const keys = Array.from({ length: stars }, (_, i) => starNumToName(i + 1)).join(', ');
  lines.push('');
  lines.push(`export default { stageDeltas: { ${keys} } };`);
  return lines.join('\n') + '\n';
}

function buildDeltasIndexTs(alias: string): string {
  return [
    `import importDeltas from "${alias}/deltas/imports";`,
    `import stageDeltas from "${alias}/deltas/stages";`,
    '',
    'export default { ...importDeltas, ...stageDeltas };',
    '',
  ].join('\n');
}

function buildStatsStagesIndexTs(alias: string, stars: number): string {
  const lines: string[] = [];
  for (let i = 1; i <= stars; i++) {
    lines.push(`import ${starNumToName(i)} from "${alias}/stats/stages/${i}star.json";`);
  }
  const keys = Array.from({ length: stars }, (_, i) => starNumToName(i + 1)).join(', ');
  lines.push('');
  lines.push(`export default { stages: { ${keys} } };`);
  return lines.join('\n') + '\n';
}

function buildStatsIndexTs(alias: string): string {
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

function buildUpgradesImportsIndexTs(alias: string): string {
  return [
    `import costs from "${alias}/upgrades/imports/costs.json";`,
    `import garageLevelXp from "${alias}/upgrades/imports/garageLevelXp.json";`,
    `import requirements from "${alias}/upgrades/imports/requirements.json";`,
    '',
    'export default { imports: { costs, garageLevelXp, requirements } };',
    '',
  ].join('\n');
}

function buildUpgradesIndexTs(alias: string): string {
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

function buildRootIndexTs(alias: string): string {
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

function convertCar(oldJsonPath: string, dry: boolean): void {
  const raw = fs.readFileSync(oldJsonPath, 'utf8');
  const data = JSON.parse(raw);

  const { brand, class: carClass, model, stars } = data;

  if (!brand || !carClass || !model || !stars) {
    console.warn(`  ⚠ Skipping ${oldJsonPath} — missing required fields (brand, class, model, stars)`);
    return;
  }

  const letterFolder = brand.replace(/\s/g, '')[0].toUpperCase();
  const brandFolder = brand.replace(/\s/g, '');
  const oldFileName = path.basename(oldJsonPath, '.json');
  const carFolder = oldFileName;
  const carDir = path.join(SEEDS_ROOT, letterFolder, brandFolder, carClass, carFolder);
  const alias = getAlias(letterFolder, brandFolder, carClass, carFolder);

  console.log(`\n🚗 Converting: ${brand} — ${model}`);
  console.log(`   From : ${path.relative(SEEDS_ROOT, oldJsonPath)}`);
  console.log(`   To   : ${path.relative(SEEDS_ROOT, carDir)}`);

  if (dry) {
    console.log('   [dry run] — no files written');
    return;
  }

  // ── Extract gold ─────────────────────────────────────────────────────────
  // Old format: { gold: { gold: { rank, topSpeed, ... } } }
  // Target:     { gold: { rank, topSpeed, ... } }
  let goldInner: Record<string, number> | null = null;
  if (isStatBlock(data.gold?.gold)) {
    goldInner = data.gold.gold;
  } else if (isStatBlock(data.gold)) {
    goldInner = data.gold;
  }
  const goldData = { gold: goldInner ?? emptyStatBlock() };

  // ── Extract stock ─────────────────────────────────────────────────────────
  // Old format: { stock: { stock: { rank, topSpeed, ... } } }
  // Target:     { stock: { rank, topSpeed, ... } }
  let stockInner: Record<string, number> | null = null;
  if (isStatBlock(data.stock?.stock)) {
    stockInner = data.stock.stock;
  } else if (isStatBlock(data.stock)) {
    stockInner = data.stock;
  }
  const stockData = { stock: stockInner ?? emptyStatBlock() };

  // ── Extract maxStar ───────────────────────────────────────────────────────
  // Build full placeholder first, then overlay any existing star data on top
  const maxStarPlaceholder = buildMaxStar(stars);
  const existingMaxStar =
    data.maxStar && typeof data.maxStar === 'object' && Object.keys(data.maxStar).length > 0
      ? data.maxStar
      : {};
  const maxStarData = { ...maxStarPlaceholder, ...existingMaxStar };

  // ── Strip extracted fields from car.json ──────────────────────────────────
  const { gold: _gold, stock: _stock, maxStar: _maxStar, ...carJson } = data;

  if (!carJson.normalizedKey) {
    console.warn(`  ⚠ Warning: normalizedKey missing on ${oldJsonPath}`);
  }

  // ── Directories ──────────────────────────────────────────────────────────
  ensureDir(carDir);
  ensureDir(path.join(carDir, 'deltas', 'imports'));
  ensureDir(path.join(carDir, 'deltas', 'stages'));
  ensureDir(path.join(carDir, 'stats', 'stages'));
  ensureDir(path.join(carDir, 'upgrades', 'imports'));

  // ── car.json ─────────────────────────────────────────────────────────────
  writeJson(path.join(carDir, 'car.json'), carJson);

  // ── deltas/imports ───────────────────────────────────────────────────────
  for (let i = 1; i <= stars; i++) {
    writeJson(path.join(carDir, 'deltas', 'imports', `${i}star.json`), []);
  }
  writeTs(path.join(carDir, 'deltas', 'imports', 'index.ts'), buildDeltasImportsIndexTs(alias, stars));

  // ── deltas/stages ────────────────────────────────────────────────────────
  for (let i = 1; i <= stars; i++) {
    writeJson(path.join(carDir, 'deltas', 'stages', `${i}star.json`), []);
  }
  writeTs(path.join(carDir, 'deltas', 'stages', 'index.ts'), buildDeltasStagesIndexTs(alias, stars));

  // ── deltas/index.ts ──────────────────────────────────────────────────────
  writeTs(path.join(carDir, 'deltas', 'index.ts'), buildDeltasIndexTs(alias));

  // ── stats/stages ─────────────────────────────────────────────────────────
  for (let i = 1; i <= stars; i++) {
    writeJson(path.join(carDir, 'stats', 'stages', `${i}star.json`), []);
  }
  writeTs(path.join(carDir, 'stats', 'stages', 'index.ts'), buildStatsStagesIndexTs(alias, stars));

  // ── stats root ───────────────────────────────────────────────────────────
  writeJson(path.join(carDir, 'stats', 'gold.json'), goldData);
  writeJson(path.join(carDir, 'stats', 'stock.json'), stockData);
  writeJson(path.join(carDir, 'stats', 'maxStar.json'), maxStarData);
  writeTs(path.join(carDir, 'stats', 'index.ts'), buildStatsIndexTs(alias));

  // ── upgrades/imports ─────────────────────────────────────────────────────
  writeJson(path.join(carDir, 'upgrades', 'imports', 'costs.json'), { perCardByStage: {} });
  writeJson(path.join(carDir, 'upgrades', 'imports', 'garageLevelXp.json'), { perCardByStage: {} });
  writeJson(path.join(carDir, 'upgrades', 'imports', 'requirements.json'), { incrementalByStage: {} });
  writeTs(path.join(carDir, 'upgrades', 'imports', 'index.ts'), buildUpgradesImportsIndexTs(alias));

  // ── upgrades root ────────────────────────────────────────────────────────
  writeJson(path.join(carDir, 'upgrades', 'creditCosts.json'), { perUpgradeByStage: {} });
  writeJson(path.join(carDir, 'upgrades', 'garageLevelXp.json'), { perUpgradeByStage: {} });
  writeJson(path.join(carDir, 'upgrades', 'progression.json'), { starStageCaps: buildProgressionCaps(stars) });
  writeTs(path.join(carDir, 'upgrades', 'index.ts'), buildUpgradesIndexTs(alias));

  // ── root index.ts ────────────────────────────────────────────────────────
  writeTs(path.join(carDir, 'index.ts'), buildRootIndexTs(alias));

  console.log(`   ✅ Done — ${stars} star car, created all folders and files`);
}

function findCarJsonFiles(filterFn: (filePath: string, data: any) => boolean): string[] {
  const results: string[] = [];

  function walk(dir: string): void {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'car.json') {
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
        } catch {
          // skip unparseable files
        }
      }
    }
  }

  walk(SEEDS_ROOT);
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const dry = hasFlag('dry');
const keysArg = getArg('keys');
const brandArg = getArg('brand');
const letterArg = getArg('letter');

if (!keysArg && !brandArg && !letterArg) {
  console.error('❌ Provide at least one filter:');
  console.error('   --keys=<normalizedKey1,normalizedKey2>');
  console.error('   --brand=<BrandName>');
  console.error('   --letter=<A-Z>');
  console.error('   --dry  (add to any command to preview without writing files)');
  process.exit(1);
}

let files: string[] = [];

if (keysArg) {
  const keys = new Set(keysArg.split(',').map((s) => s.trim()));
  files = findCarJsonFiles((_, data) => keys.has(data.normalizedKey));
  console.log(`\n🔑 Filtering by normalizedKey: ${[...keys].join(', ')}`);
}

if (brandArg) {
  const brand = brandArg.trim();
  files = findCarJsonFiles((_, data) => data.brand?.replace(/\s/g, '') === brand.replace(/\s/g, ''));
  console.log(`\n🏭 Filtering by brand: ${brand}`);
}

if (letterArg) {
  const letter = letterArg.trim().toUpperCase();
  files = findCarJsonFiles((filePath) => {
    const rel = path.relative(SEEDS_ROOT, filePath);
    return rel.startsWith(letter + path.sep) || rel.startsWith(letter + '/');
  });
  console.log(`\n🔤 Filtering by letter: ${letter}`);
}

if (files.length === 0) {
  console.log('⚠ No matching old-format car files found.');
  process.exit(0);
}

console.log(`\n📋 Found ${files.length} car(s) to convert${dry ? ' [DRY RUN]' : ''}:`);
for (const f of files) {
  console.log(`   ${path.relative(SEEDS_ROOT, f)}`);
}

for (const f of files) {
  convertCar(f, dry);
}

console.log(`\n✅ Conversion complete — ${files.length} car(s) processed${dry ? ' (dry run, no files written)' : ''}.`);