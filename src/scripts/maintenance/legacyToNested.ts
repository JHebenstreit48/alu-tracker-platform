// src/scripts/maintenance/legacyToNested.ts
import * as fs from "node:fs";
import * as path from "node:path";

import { pruneLegacyStats } from "@/utils/pruneLegacyStats";

type StatBlock = {
  rank?: number;
  topSpeed?: number;
  acceleration?: number;
  handling?: number;
  nitro?: number;
};

type MaxStarKey = "oneStar" | "twoStar" | "threeStar" | "fourStar" | "fiveStar" | "sixStar";
type AnyObj = Record<string, any>;

const STAR_PREFIXES: MaxStarKey[] = ["oneStar", "twoStar", "threeStar", "fourStar", "fiveStar", "sixStar"];

function any(...vals: unknown[]): boolean {
  return vals.some((v) => v !== undefined && v !== null);
}

/**
 * Skip new granular format:
 * - any JSON inside folders: stats/, deltas/, upgrades/, imports/
 * - common granular filenames: stock.json, maxStar.json, gold.json, car.json, etc.
 */
function shouldSkipByPath(filePath: string): boolean {
  const norm = filePath.split(path.sep).join("/");
  const base = path.basename(filePath).toLowerCase();

  const skipDirs = ["/stats/", "/deltas/", "/upgrades/", "/imports/"];
  if (skipDirs.some((seg) => norm.includes(seg))) return true;

  const skipNames = new Set([
    "stock.json",
    "maxstar.json",
    "gold.json",
    "car.json",
    "progression.json",
    "requirements.json",
    "costs.json",
    "creditcosts.json",
    "garagelevelxp.json",
  ]);
  if (skipNames.has(base)) return true;

  return false;
}

function hasAnyLegacyKeys(obj: AnyObj): boolean {
  const hasLegacyStock = any(obj.stockRank, obj.stockTopSpeed, obj.stockAcceleration, obj.stockHandling, obj.stockNitro);

  const hasLegacyGold = any(obj.goldMaxRank, obj.goldTopSpeed, obj.goldAcceleration, obj.goldHandling, obj.goldNitro);

  const hasLegacyMaxStar = STAR_PREFIXES.some((p) =>
    any(
      obj[`${p}MaxRank`],
      obj[`${p}MaxTopSpeed`],
      obj[`${p}MaxAcceleration`],
      obj[`${p}MaxHandling`],
      obj[`${p}MaxNitro`]
    )
  );

  return hasLegacyStock || hasLegacyGold || hasLegacyMaxStar;
}

function hasNestedBlocks(obj: AnyObj): boolean {
  return Boolean(
    (obj.stock && obj.stock.stock) ||
      (obj.gold && obj.gold.gold) ||
      (obj.maxStar &&
        (obj.maxStar.oneStar ||
          obj.maxStar.twoStar ||
          obj.maxStar.threeStar ||
          obj.maxStar.fourStar ||
          obj.maxStar.fiveStar ||
          obj.maxStar.sixStar))
  );
}

/**
 * Skip if:
 * - prune OFF: already nested OR no legacy keys exist
 * - prune ON: no legacy keys exist (even if nested exists, allow prune-only)
 */
function shouldSkipByContent(obj: AnyObj, prune: boolean): boolean {
  const legacy = hasAnyLegacyKeys(obj);
  const nested = hasNestedBlocks(obj);

  if (prune) return !legacy;
  if (nested) return true;
  return !legacy;
}

function addNestedBlocks(obj: AnyObj): boolean {
  let changed = false;

  // stock -> stock.stock (only create obj.stock if we actually need it)
  const hasLegacyStock = any(obj.stockRank, obj.stockTopSpeed, obj.stockAcceleration, obj.stockHandling, obj.stockNitro);
  if (hasLegacyStock) {
    obj.stock ??= {};
    if (!obj.stock.stock) {
      obj.stock.stock = {
        rank: obj.stockRank,
        topSpeed: obj.stockTopSpeed,
        acceleration: obj.stockAcceleration,
        handling: obj.stockHandling,
        nitro: obj.stockNitro,
      } satisfies StatBlock;
      changed = true;
    }
  }

  // gold -> gold.gold
  const hasLegacyGold = any(obj.goldMaxRank, obj.goldTopSpeed, obj.goldAcceleration, obj.goldHandling, obj.goldNitro);
  if (hasLegacyGold) {
    obj.gold ??= {};
    if (!obj.gold.gold) {
      obj.gold.gold = {
        rank: obj.goldMaxRank,
        topSpeed: obj.goldTopSpeed,
        acceleration: obj.goldAcceleration,
        handling: obj.goldHandling,
        nitro: obj.goldNitro,
      } satisfies StatBlock;
      changed = true;
    }
  }

  // maxStar tiers (only create obj.maxStar if we actually need it)
  const hasAnyLegacyMaxStar = STAR_PREFIXES.some((p) =>
    any(
      obj[`${p}MaxRank`],
      obj[`${p}MaxTopSpeed`],
      obj[`${p}MaxAcceleration`],
      obj[`${p}MaxHandling`],
      obj[`${p}MaxNitro`]
    )
  );

  if (hasAnyLegacyMaxStar) {
    obj.maxStar ??= {};

    for (const prefix of STAR_PREFIXES) {
      if (obj.maxStar[prefix]) continue;

      const block: StatBlock = {
        rank: obj[`${prefix}MaxRank`],
        topSpeed: obj[`${prefix}MaxTopSpeed`],
        acceleration: obj[`${prefix}MaxAcceleration`],
        handling: obj[`${prefix}MaxHandling`],
        nitro: obj[`${prefix}MaxNitro`],
      };

      if (any(block.rank, block.topSpeed, block.acceleration, block.handling, block.nitro)) {
        obj.maxStar[prefix] = block;
        changed = true;
      }
    }
  }

  return changed;
}

function walkJsonFiles(rootDir: string): string[] {
  const out: string[] = [];
  const stack = [rootDir];

  while (stack.length) {
    const dir = stack.pop()!;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile() && e.name.endsWith(".json")) out.push(p);
    }
  }
  return out;
}

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry") args.dry = true;
    else if (a === "--file") args.file = argv[++i];
    else if (a === "--root") args.root = argv[++i];
    else if (a === "--verbose") args.verbose = true;
    else if (a === "--include-missing-key") args.includeMissingKey = true;
    else if (a === "--limit") args.limit = argv[++i];
    else if (a === "--keys") args.keys = argv[++i];
    else if (a.startsWith("--keys=")) args.keys = a.substring("--keys=".length);
    else if (a === "--prune") args.prune = true;
  }
  return args;
}

function writeJson(fp: string, obj: AnyObj) {
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dry = Boolean(args.dry);
  const verbose = Boolean(args.verbose);
  const includeMissingKey = Boolean(args.includeMissingKey);
  const prune = Boolean(args.prune);

  const file = typeof args.file === "string" ? path.resolve(args.file) : null;
  const root = typeof args.root === "string" ? path.resolve(args.root) : null;

  const keysCsv = typeof args.keys === "string" ? args.keys : "";
  const keys = keysCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const keySet = new Set(keys);

  const limit = typeof args.limit === "string" ? Number(args.limit) : undefined;

  if (!file && !root) {
    console.error(
      "Usage:\n" +
        "  --file <path-to-legacy-car.json>\n" +
        "  OR --root <cars-root-folder> [--dry] [--verbose]\n" +
        "  Optional: --keys=a,b,c (requires --root)\n" +
        "  Optional: --include-missing-key (prints files missing normalizedKey)\n" +
        "  Optional: --limit N\n" +
        "  Optional: --prune (delete old flat keys AFTER/INDEPENDENT of conversion)"
    );
    process.exit(1);
  }

  if (keys.length > 0 && !root) {
    console.error("When using --keys, you must also pass --root <cars-root-folder> so the script can search files.");
    process.exit(1);
  }

  let targets = file ? [file] : walkJsonFiles(root!);

  // If keys provided, narrow targets to only those matching normalizedKey
  if (keySet.size > 0) {
    const matched: string[] = [];
    const missingKeys: string[] = [];

    for (const fp of targets) {
      if (shouldSkipByPath(fp)) continue;

      let raw: string;
      try {
        raw = fs.readFileSync(fp, "utf8");
      } catch (e: any) {
        if (verbose) console.log(`[skip:read] ${fp} (${e?.code ?? ""})`);
        continue;
      }

      let obj: AnyObj;
      try {
        obj = JSON.parse(raw);
      } catch {
        if (verbose) console.log(`[skip:json] ${fp}`);
        continue;
      }

      const nk = typeof obj.normalizedKey === "string" ? obj.normalizedKey : null;
      if (!nk) {
        if (includeMissingKey) missingKeys.push(fp);
        continue;
      }

      if (keySet.has(nk)) matched.push(fp);
    }

    if (includeMissingKey && missingKeys.length > 0) {
      console.log(`\nFiles missing normalizedKey (showing up to 30):`);
      for (const fp of missingKeys.slice(0, 30)) console.log(`  ${fp}`);
      if (missingKeys.length > 30) console.log(`  ...and ${missingKeys.length - 30} more`);
      console.log("");
    }

    if (matched.length === 0) {
      console.log(`No files found for keys: ${keys.join(", ")}`);
      process.exit(0);
    }

    targets = matched;
  }

  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    targets = targets.slice(0, limit);
  }

  let scanned = 0;
  let changed = 0;
  let skipped = 0;

  for (const fp of targets) {
    scanned++;

    if (shouldSkipByPath(fp)) {
      skipped++;
      if (verbose) console.log(`[skip:path] ${fp}`);
      continue;
    }

    let raw: string;
    try {
      raw = fs.readFileSync(fp, "utf8");
    } catch (e: any) {
      skipped++;
      console.log(`[skip:read] ${fp}`);
      console.log(`  error: ${e?.code ?? ""} ${e?.message ?? e}`);
      continue;
    }

    let obj: AnyObj;
    try {
      obj = JSON.parse(raw);
    } catch (e: any) {
      skipped++;
      console.log(`[skip:json] ${fp}`);
      console.log(`  error: ${e?.message ?? e}`);
      continue;
    }

    if (shouldSkipByContent(obj, prune)) {
      skipped++;
      if (verbose) console.log(`[skip:content] ${fp}`);
      continue;
    }

    // Convert (if needed)
    const didConvert = addNestedBlocks(obj);

    // Prune independently (if requested)
    const didPrune = prune ? pruneLegacyStats(obj) : false;

    if (!didConvert && !didPrune) {
      skipped++;
      if (verbose) console.log(`[skip:unchanged] ${fp}`);
      continue;
    }

    changed++;
    if (dry) {
      console.log(`[dry-run] would update: ${fp}`);
    } else {
      writeJson(fp, obj);
      console.log(`[updated] ${fp}`);
    }
  }

  console.log("\nSummary:");
  console.log(`  scanned: ${scanned}`);
  console.log(`  changed: ${changed}${dry ? " (dry-run)" : ""}`);
  console.log(`  skipped: ${skipped}`);
}

main();