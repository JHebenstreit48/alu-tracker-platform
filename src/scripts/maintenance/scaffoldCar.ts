import * as path from "node:path";
import { findCarFolders, readJson, scaffoldCarFolder } from "@/scripts/maintenance/carDataScaffold/scaffoldFiles";
import type { ScaffoldArgs } from "@/types/scripts/maintenance/scaffoldCar";

function parseArgs(argv: string[]): ScaffoldArgs | null {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry") args.dry = true;
    else if (a === "--verbose") args.verbose = true;
    else if (a === "--all") args.all = true;
    else if (a === "--fix") args.fix = true;
    else if (a === "--root") args.root = argv[++i];
    else if (a.startsWith("--root=")) args.root = a.slice("--root=".length);
    else if (a === "--keys") args.keys = argv[++i];
    else if (a.startsWith("--keys=")) args.keys = a.slice("--keys=".length);
  }

  if (!args.root) return null;

  const keysCsv = typeof args.keys === "string" ? args.keys : "";
  const keys = new Set(keysCsv.split(",").map((s) => s.trim()).filter(Boolean));

  return {
    root: path.resolve(args.root as string),
    keys,
    all: Boolean(args.all),
    dry: Boolean(args.dry),
    verbose: Boolean(args.verbose),
    fix: Boolean(args.fix),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args) {
    console.error(
      "Usage:\n" +
      "  --root <seeds/cars path>  (required)\n" +
      "  --keys=a,b,c              target specific normalizedKeys\n" +
      "  --all                     scaffold all car folders\n" +
      "  --dry                     preview only\n" +
      "  --fix                     auto-fix outdated index.ts files\n" +
      "  --verbose                 show existing files too\n"
    );
    process.exit(1);
  }

  if (!args.all && args.keys.size === 0) {
    console.error("Provide --keys=a,b,c or --all");
    process.exit(1);
  }

  console.log(`🔍 Root: ${args.root}`);
  console.log(`🧪 Mode: ${args.all ? "ALL" : `KEYS: ${[...args.keys].join(", ")}`} | Dry: ${args.dry} | Fix: ${args.fix}`);

  const folders = findCarFolders(args.root);
  let scanned = 0;
  let totalCreated = 0;
  let totalFixed = 0;

  for (const folder of folders) {
    if (!args.all) {
      const carJson = readJson(path.join(folder, "car.json"));
      const nk = carJson && typeof carJson.normalizedKey === "string"
        ? carJson.normalizedKey : null;
      if (!nk || !args.keys.has(nk)) continue;
    }

    scanned++;
    const { created, fixed } = scaffoldCarFolder(
      folder, args.root, args.dry, args.verbose, args.fix
    );
    totalCreated += created;
    totalFixed += fixed;
  }

  console.log("\n📊 Summary:");
  console.log(`  Scanned:  ${scanned}`);
  console.log(`  Created:  ${totalCreated}${args.dry ? " (dry-run)" : ""}`);
  console.log(`  Fixed:    ${totalFixed}${args.dry ? " (dry-run)" : ""}`);
  if (args.dry && (totalCreated > 0 || totalFixed > 0)) {
    console.log("\nℹ️  Dry-run only. Re-run without --dry to apply.");
  }
}

main();