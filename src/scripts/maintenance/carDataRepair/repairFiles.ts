import * as fs from "node:fs";
import * as path from "node:path";
import type { RepairResult, StarCount } from "@/types/scripts/repairCar/index";
import { getStageRanges, getImportStages, getStageCaps } from "@/scripts/maintenance/carDataRepair/repairChecks";
import {
  repairStatsStagesFile,
  repairDeltaStagesFile,
  repairDeltaImportsFile,
  repairStatsObject,
  repairUpgradesStagesObject,
  repairImportsObject,
} from "@/scripts/maintenance/carDataRepair/repairMerge";

type AnyObj = Record<string, unknown>;

function readJson(fp: string): unknown | null {
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); } catch { return null; }
}

function writeJson(fp: string, obj: unknown, dry: boolean): boolean {
  if (dry) { console.log(`  [dry] would fix: ${fp}`); return true; }
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + "\n", "utf8");
  console.log(`  [fixed] ${fp}`);
  return true;
}

function starFiles(stars: number): string[] {
  return ["1star", "2star", "3star", "4star", "5star", "6star"].slice(0, stars);
}

export function repairCarFolder(
  folder: string,
  dry: boolean,
  verbose: boolean
): RepairResult {
  const carJsonPath = path.join(folder, "car.json");
  const carJson = readJson(carJsonPath) as AnyObj | null;
  const key = carJson && typeof carJson.normalizedKey === "string"
    ? carJson.normalizedKey : path.basename(folder);
  const stars = Math.min(Math.max((carJson?.stars as number) ?? 5, 3), 6) as StarCount;

  const issues: string[] = [];
  let fixed = 0;
  let skipped = 0;

  const ranges = getStageRanges(stars);
  const importStages = getImportStages(stars);
  const caps = getStageCaps(stars);
  const maxStage = caps[stars];
  const files = starFiles(stars);

  console.log(`\n🔧 ${key} (${stars}★)`);

  // ── stats/stages ──
  for (let i = 0; i < stars; i++) {
    const fp = path.join(folder, "stats", "stages", `${files[i]}.json`);
    if (!fs.existsSync(fp)) { issues.push(`missing stats/stages/${files[i]}.json`); continue; }
    const raw = readJson(fp);
    if (!Array.isArray(raw)) { issues.push(`invalid stats/stages/${files[i]}.json`); continue; }
    const { result, changed } = repairStatsStagesFile(raw, ranges[i]);
    if (changed) { if (writeJson(fp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] stats/stages/${files[i]}.json`); skipped++; }
  }

  // ── deltas/stages ──
  for (let i = 0; i < stars; i++) {
    const fp = path.join(folder, "deltas", "stages", `${files[i]}.json`);
    if (!fs.existsSync(fp)) { issues.push(`missing deltas/stages/${files[i]}.json`); continue; }
    const raw = readJson(fp);
    if (!Array.isArray(raw)) { issues.push(`invalid deltas/stages/${files[i]}.json`); continue; }
    const { result, changed } = repairDeltaStagesFile(raw, ranges[i]);
    if (changed) { if (writeJson(fp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] deltas/stages/${files[i]}.json`); skipped++; }
  }

  // ── deltas/imports ──
  for (let i = 0; i < stars; i++) {
    const fp = path.join(folder, "deltas", "imports", `${files[i]}.json`);
    if (!fs.existsSync(fp)) { issues.push(`missing deltas/imports/${files[i]}.json`); continue; }
    const raw = readJson(fp);
    if (!Array.isArray(raw)) { issues.push(`invalid deltas/imports/${files[i]}.json`); continue; }
    const { result, changed } = repairDeltaImportsFile(raw, caps[i + 1]);
    if (changed) { if (writeJson(fp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] deltas/imports/${files[i]}.json`); skipped++; }
  }

  // ── stats/stock.json ──
  const stockFp = path.join(folder, "stats", "stock.json");
  if (fs.existsSync(stockFp)) {
    const raw = readJson(stockFp) as AnyObj;
    const template = { stock: { rank: 0, topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 } };
    const { result, changed } = repairStatsObject(raw, template);
    if (changed) { if (writeJson(stockFp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] stats/stock.json`); skipped++; }
  }

  // ── stats/gold.json ──
  const goldFp = path.join(folder, "stats", "gold.json");
  if (fs.existsSync(goldFp)) {
    const raw = readJson(goldFp) as AnyObj;
    const template = { gold: { rank: 0, topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 } };
    const { result, changed } = repairStatsObject(raw, template);
    if (changed) { if (writeJson(goldFp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] stats/gold.json`); skipped++; }
  }

  // ── stats/maxStar.json ──
  const maxStarFp = path.join(folder, "stats", "maxStar.json");
  if (fs.existsSync(maxStarFp)) {
    const raw = readJson(maxStarFp) as AnyObj;
    const starNames = ["oneStar","twoStar","threeStar","fourStar","fiveStar","sixStar"].slice(0, stars);
    const template: AnyObj = {};
    for (const n of starNames) template[n] = { rank: 0, topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 };
    const { result, changed } = repairStatsObject(raw, template);
    if (changed) { if (writeJson(maxStarFp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] stats/maxStar.json`); skipped++; }
  }

  // ── upgrades/creditCosts.json ──
  const creditFp = path.join(folder, "upgrades", "creditCosts.json");
  if (fs.existsSync(creditFp)) {
    const raw = readJson(creditFp) as AnyObj;
    const { result, changed } = repairUpgradesStagesObject(raw, maxStage);
    if (changed) { if (writeJson(creditFp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] upgrades/creditCosts.json`); skipped++; }
  }

  // ── upgrades/garageLevelXp.json ──
  const garageFp = path.join(folder, "upgrades", "garageLevelXp.json");
  if (fs.existsSync(garageFp)) {
    const raw = readJson(garageFp) as AnyObj;
    const { result, changed } = repairUpgradesStagesObject(raw, maxStage);
    if (changed) { if (writeJson(garageFp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] upgrades/garageLevelXp.json`); skipped++; }
  }

  // ── upgrades/imports/costs.json ──
  const costsFp = path.join(folder, "upgrades", "imports", "costs.json");
  if (fs.existsSync(costsFp)) {
    const raw = readJson(costsFp) as AnyObj;
    const { result, changed } = repairImportsObject(raw, importStages, "costs");
    if (changed) { if (writeJson(costsFp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] upgrades/imports/costs.json`); skipped++; }
  }

  // ── upgrades/imports/garageLevelXp.json ──
  const importsGarageFp = path.join(folder, "upgrades", "imports", "garageLevelXp.json");
  if (fs.existsSync(importsGarageFp)) {
    const raw = readJson(importsGarageFp) as AnyObj;
    const { result, changed } = repairImportsObject(raw, importStages, "garageLevelXp");
    if (changed) { if (writeJson(importsGarageFp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] upgrades/imports/garageLevelXp.json`); skipped++; }
  }

  // ── upgrades/imports/requirements.json ──
  const reqFp = path.join(folder, "upgrades", "imports", "requirements.json");
  if (fs.existsSync(reqFp)) {
    const raw = readJson(reqFp) as AnyObj;
    const { result, changed } = repairImportsObject(raw, importStages, "requirements");
    if (changed) { if (writeJson(reqFp, result, dry)) fixed++; }
    else { if (verbose) console.log(`  [ok] upgrades/imports/requirements.json`); skipped++; }
  }

  if (issues.length > 0) {
    for (const issue of issues) console.log(`  [issue] ${issue}`);
  }

  return { key, fixed, skipped, issues };
}

export function findCarFolders(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    if (entries.some((e) => e.isFile() && e.name === "car.json")) {
      out.push(dir);
    } else {
      for (const e of entries) {
        if (e.isDirectory()) stack.push(path.join(dir, e.name));
      }
    }
  }
  return out;
}