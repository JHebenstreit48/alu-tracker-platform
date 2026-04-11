import fs from 'fs';
import path from 'path';
import {
  writeJson, writeTs, ensureDir,
  emptyStatBlock, isStatBlock, buildMaxStar,
  buildProgressionCaps, getAlias,
} from '@/utils/scripts/maintenance/convertToNewFormat/fileHelpers';
import {
  buildDeltasImportsIndexTs, buildDeltasStagesIndexTs, buildDeltasIndexTs,
  buildStatsStagesIndexTs, buildStatsIndexTs,
  buildUpgradesImportsIndexTs, buildUpgradesIndexTs, buildRootIndexTs,
} from '@/utils/scripts/maintenance/convertToNewFormat/builders';

export function convertCar(seedsRoot: string, oldJsonPath: string, dry: boolean): void {
  const raw = fs.readFileSync(oldJsonPath, 'utf8');
  const data = JSON.parse(raw);
  const { brand, class: carClass, model, stars } = data;

  if (!brand || !carClass || !model || !stars) {
    console.warn(`  ⚠ Skipping ${oldJsonPath} — missing required fields (brand, class, model, stars)`);
    return;
  }

  const letterFolder = brand.replace(/\s/g, '')[0].toUpperCase();
  const brandFolder = brand.replace(/\s/g, '');
  const carFolder = path.basename(path.dirname(oldJsonPath));
  const carDir = path.dirname(oldJsonPath);
  const alias = getAlias(letterFolder, brandFolder, carClass, carFolder);

  console.log(`\n🚗 Converting: ${brand} — ${model}`);
  console.log(`   Folder: ${path.relative(seedsRoot, carDir)}`);

  if (dry) { console.log('   [dry run] — no files written'); return; }

  // ── Extract gold ──────────────────────────────────────────────────────────
  let goldInner: Record<string, number> | null = null;
  if (isStatBlock(data.gold?.gold)) goldInner = data.gold.gold;
  else if (isStatBlock(data.gold)) goldInner = data.gold;
  const goldData = { gold: goldInner ?? emptyStatBlock() };

  // ── Extract stock ─────────────────────────────────────────────────────────
  let stockInner: Record<string, number> | null = null;
  if (isStatBlock(data.stock?.stock)) stockInner = data.stock.stock;
  else if (isStatBlock(data.stock)) stockInner = data.stock;
  const stockData = { stock: stockInner ?? emptyStatBlock() };

  // ── Extract maxStar ───────────────────────────────────────────────────────
  const maxStarPlaceholder = buildMaxStar(stars);
  const existingMaxStar = data.maxStar && typeof data.maxStar === 'object' && Object.keys(data.maxStar).length > 0
    ? data.maxStar : {};
  const maxStarData = { ...maxStarPlaceholder, ...existingMaxStar };

  const { gold: _g, stock: _s, maxStar: _m, ...carJson } = data;
  if (!carJson.normalizedKey) console.warn(`  ⚠ Warning: normalizedKey missing on ${oldJsonPath}`);

  // ── Directories ───────────────────────────────────────────────────────────
  ensureDir(carDir);
  ensureDir(path.join(carDir, 'deltas', 'imports'));
  ensureDir(path.join(carDir, 'deltas', 'stages'));
  ensureDir(path.join(carDir, 'stats', 'stages'));
  ensureDir(path.join(carDir, 'upgrades', 'imports'));

  // ── car.json ──────────────────────────────────────────────────────────────
  const carJsonPath = path.join(carDir, 'car.json');
  if (!fs.existsSync(carJsonPath)) writeJson(carJsonPath, carJson);
  else console.log(`   [skip] car.json already exists — preserving existing data`);

  // ── deltas ────────────────────────────────────────────────────────────────
  for (let i = 1; i <= stars; i++) {
    const fp = path.join(carDir, 'deltas', 'imports', `${i}star.json`);
    if (!fs.existsSync(fp)) writeJson(fp, []);
  }
  writeTs(path.join(carDir, 'deltas', 'imports', 'index.ts'), buildDeltasImportsIndexTs(alias, stars));

  for (let i = 1; i <= stars; i++) {
    const fp = path.join(carDir, 'deltas', 'stages', `${i}star.json`);
    if (!fs.existsSync(fp)) writeJson(fp, []);
  }
  writeTs(path.join(carDir, 'deltas', 'stages', 'index.ts'), buildDeltasStagesIndexTs(alias, stars));
  writeTs(path.join(carDir, 'deltas', 'index.ts'), buildDeltasIndexTs(alias));

  // ── stats ─────────────────────────────────────────────────────────────────
  for (let i = 1; i <= stars; i++) {
    const fp = path.join(carDir, 'stats', 'stages', `${i}star.json`);
    if (!fs.existsSync(fp)) writeJson(fp, []);
  }
  writeTs(path.join(carDir, 'stats', 'stages', 'index.ts'), buildStatsStagesIndexTs(alias, stars));

  const goldFp = path.join(carDir, 'stats', 'gold.json');
  if (!fs.existsSync(goldFp)) writeJson(goldFp, goldData);
  else console.log(`   [skip] stats/gold.json already exists — preserving existing data`);

  const stockFp = path.join(carDir, 'stats', 'stock.json');
  if (!fs.existsSync(stockFp)) writeJson(stockFp, stockData);
  else console.log(`   [skip] stats/stock.json already exists — preserving existing data`);

  const maxStarFp = path.join(carDir, 'stats', 'maxStar.json');
  if (!fs.existsSync(maxStarFp)) writeJson(maxStarFp, maxStarData);
  else console.log(`   [skip] stats/maxStar.json already exists — preserving existing data`);

  writeTs(path.join(carDir, 'stats', 'index.ts'), buildStatsIndexTs(alias));

  // ── upgrades ──────────────────────────────────────────────────────────────
  const costsFp = path.join(carDir, 'upgrades', 'imports', 'costs.json');
  if (!fs.existsSync(costsFp)) writeJson(costsFp, { perCardByStage: {} });

  const importsGarageFp = path.join(carDir, 'upgrades', 'imports', 'garageLevelXp.json');
  if (!fs.existsSync(importsGarageFp)) writeJson(importsGarageFp, { perCardByStage: {} });

  const reqFp = path.join(carDir, 'upgrades', 'imports', 'requirements.json');
  if (!fs.existsSync(reqFp)) writeJson(reqFp, { incrementalByStage: {} });

  writeTs(path.join(carDir, 'upgrades', 'imports', 'index.ts'), buildUpgradesImportsIndexTs(alias));

  const creditFp = path.join(carDir, 'upgrades', 'creditCosts.json');
  if (!fs.existsSync(creditFp)) writeJson(creditFp, { perUpgradeByStage: {} });

  const garageFp = path.join(carDir, 'upgrades', 'garageLevelXp.json');
  if (!fs.existsSync(garageFp)) writeJson(garageFp, { perUpgradeByStage: {} });

  const progressionFp = path.join(carDir, 'upgrades', 'progression.json');
  if (!fs.existsSync(progressionFp)) writeJson(progressionFp, { starStageCaps: buildProgressionCaps(stars) });

  writeTs(path.join(carDir, 'upgrades', 'index.ts'), buildUpgradesIndexTs(alias));

  // ── root index.ts ─────────────────────────────────────────────────────────
  writeTs(path.join(carDir, 'index.ts'), buildRootIndexTs(alias));

  console.log(`   ✅ Done — ${stars} star car, created all missing folders and files`);
}