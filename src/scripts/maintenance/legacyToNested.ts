// src/scripts/maintenance/legacyToNested.ts
import * as fs from "node:fs";
import * as path from "node:path";

type StatBlock = {
  rank?: number;
  topSpeed?: number;
  acceleration?: number;
  handling?: number;
  nitro?: number;
};

type AnyObj = Record<string, any>;

const STAR_PREFIXES = [
  "oneStar",
  "twoStar",
  "threeStar",
  "fourStar",
  "fiveStar",
  "sixStar",
] as const;

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry") args.dry = true;
    else if (a === "--verbose") args.verbose = true;
    else if (a === "--all") args.all = true;
    else if (a === "--root") args.root = argv[++i];
    else if (a.startsWith("--root=")) args.root = a.slice("--root=".length);
    else if (a === "--keys") args.keys = argv[++i];
    else if (a.startsWith("--keys=")) args.keys = a.slice("--keys=".length);
  }
  return args;
}

function readJson(fp: string): AnyObj | null {
  try {
    return JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(fp: string, obj: AnyObj) {
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function convertStock(obj: AnyObj): { result: AnyObj; changed: boolean } {
  if (obj.stock && typeof obj.stock === "object") {
    return { result: obj, changed: false };
  }

  const hasFlat =
    obj.stockRank !== undefined ||
    obj.stockTopSpeed !== undefined ||
    obj.stockAcceleration !== undefined ||
    obj.stockHandling !== undefined ||
    obj.stockNitro !== undefined;

  if (!hasFlat) return { result: obj, changed: false };

  const block: StatBlock = {
    rank: obj.stockRank,
    topSpeed: obj.stockTopSpeed,
    acceleration: obj.stockAcceleration,
    handling: obj.stockHandling,
    nitro: obj.stockNitro,
  };

  return { result: { stock: block }, changed: true };
}

function convertGold(obj: AnyObj): { result: AnyObj; changed: boolean } {
  if (obj.gold && typeof obj.gold === "object") {
    return { result: obj, changed: false };
  }

  const hasFlat =
    obj.goldMaxRank !== undefined ||
    obj.goldTopSpeed !== undefined ||
    obj.goldAcceleration !== undefined ||
    obj.goldHandling !== undefined ||
    obj.goldNitro !== undefined;

  if (!hasFlat) return { result: obj, changed: false };

  const block: StatBlock = {
    rank: obj.goldMaxRank,
    topSpeed: obj.goldTopSpeed,
    acceleration: obj.goldAcceleration,
    handling: obj.goldHandling,
    nitro: obj.goldNitro,
  };

  return { result: { gold: block }, changed: true };
}

function convertMaxStar(obj: AnyObj): { result: AnyObj; changed: boolean } {
  const alreadyNested = STAR_PREFIXES.some(
    (p) => obj[p] && typeof obj[p] === "object"
  );
  if (alreadyNested) return { result: obj, changed: false };

  const hasFlat = STAR_PREFIXES.some(
    (p) =>
      obj[`${p}MaxRank`] !== undefined ||
      obj[`${p}MaxTopSpeed`] !== undefined ||
      obj[`${p}MaxAcceleration`] !== undefined ||
      obj[`${p}MaxHandling`] !== undefined ||
      obj[`${p}MaxNitro`] !== undefined
  );

  if (!hasFlat) return { result: obj, changed: false };

  const result: AnyObj = {};
  for (const prefix of STAR_PREFIXES) {
    result[prefix] = {
      rank: obj[`${prefix}MaxRank`],
      topSpeed: obj[`${prefix}MaxTopSpeed`],
      acceleration: obj[`${prefix}MaxAcceleration`],
      handling: obj[`${prefix}MaxHandling`],
      nitro: obj[`${prefix}MaxNitro`],
    } satisfies StatBlock;
  }

  return { result, changed: true };
}

function findCarFolders(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
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

function processCarFolder(
  folder: string,
  dry: boolean,
  verbose: boolean
): { key: string; changed: boolean } | null {
  const carJson = readJson(path.join(folder, "car.json"));
  const key =
    carJson && typeof carJson.normalizedKey === "string"
      ? carJson.normalizedKey
      : null;

  if (!key) {
    if (verbose) console.log(`[skip:no-key] ${folder}`);
    return null;
  }

  const statsDir = path.join(folder, "stats");
  let anyChanged = false;

  const conversions: Array<{
    file: string;
    convert: (o: AnyObj) => { result: AnyObj; changed: boolean };
  }> = [
    { file: "stock.json", convert: convertStock },
    { file: "gold.json", convert: convertGold },
    { file: "maxStar.json", convert: convertMaxStar },
  ];

  for (const { file, convert } of conversions) {
    const fp = path.join(statsDir, file);
    if (!fs.existsSync(fp)) {
      if (verbose) console.log(`[skip:missing] ${key}: stats/${file}`);
      continue;
    }

    const raw = readJson(fp);
    if (!raw) {
      if (verbose) console.log(`[skip:parse-error] ${key}: stats/${file}`);
      continue;
    }

    const { result, changed } = convert(raw);
    if (!changed) {
      if (verbose) console.log(`[skip:already-nested] ${key}: stats/${file}`);
      continue;
    }

    anyChanged = true;
    if (dry) {
      console.log(`[dry] ${key}: stats/${file} would be converted`);
    } else {
      writeJson(fp, result);
      console.log(`[updated] ${key}: stats/${file}`);
    }
  }

  return { key, changed: anyChanged };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dry = Boolean(args.dry);
  const verbose = Boolean(args.verbose);
  const useAll = Boolean(args.all);
  const root =
    typeof args.root === "string" ? path.resolve(args.root) : null;
  const keysCsv = typeof args.keys === "string" ? args.keys : "";
  const keySet = new Set(
    keysCsv.split(",").map((s) => s.trim()).filter(Boolean)
  );

  if (!root) {
    console.error(
      "Usage:\n" +
        "  --root <seeds/cars path>  (required)\n" +
        "  --keys=a,b,c              target specific normalizedKeys\n" +
        "  --all                     target every car\n" +
        "  --dry                     preview only\n" +
        "  --verbose                 show skipped files\n"
    );
    process.exit(1);
  }

  if (!useAll && keySet.size === 0) {
    console.error("Provide --keys=a,b,c or --all");
    process.exit(1);
  }

  console.log(`🔍 Root: ${root}`);
  console.log(
    `🧪 Mode: ${useAll ? "ALL" : `KEYS: ${[...keySet].join(", ")}`} | Dry: ${dry}`
  );
  console.log("");

  const carFolders = findCarFolders(root);

  let scanned = 0;
  let converted = 0;
  let skipped = 0;

  for (const folder of carFolders) {
    if (!useAll) {
      const carJson = readJson(path.join(folder, "car.json"));
      const nk =
        carJson && typeof carJson.normalizedKey === "string"
          ? carJson.normalizedKey
          : null;
      if (!nk || !keySet.has(nk)) {
        skipped++;
        continue;
      }
    }

    scanned++;
    const result = processCarFolder(folder, dry, verbose);

    if (!result) {
      skipped++;
    } else if (result.changed) {
      converted++;
    }
  }

  console.log("\n📊 Summary:");
  console.log(`  Scanned:   ${scanned}`);
  console.log(`  Converted: ${converted}${dry ? " (dry-run)" : ""}`);
  console.log(`  Skipped:   ${skipped}`);

  if (dry && converted > 0) {
    console.log("\nℹ️  Dry-run only. Re-run without --dry to apply.");
  }
}

main();