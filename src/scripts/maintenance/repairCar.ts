import * as path from "node:path";
import * as fs from "node:fs";
import { findCarFolders, repairCarFolder } from "@/scripts/maintenance/carDataRepair/repairFiles";
import type { RepairArgs } from "@/types/scripts/maintenance/repairCar/index";

function parseArgs(argv: string[]): RepairArgs | null {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry") args.dry = true;
    else if (a === "--verbose") args.verbose = true;
    else if (a === "--all") args.all = true;
    else if (a === "--report") args.report = true;
    else if (a === "--root") args.root = argv[++i];
    else if (a.startsWith("--root=")) args.root = a.slice("--root=".length);
    else if (a === "--keys") args.keys = argv[++i];
    else if (a.startsWith("--keys=")) args.keys = a.slice("--keys=".length);
    else if (a === "--brand") args.brand = argv[++i];
    else if (a.startsWith("--brand=")) args.brand = a.slice("--brand=".length);
    else if (a === "--letter") args.letter = argv[++i];
    else if (a.startsWith("--letter=")) args.letter = a.slice("--letter=".length);
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
    report: Boolean(args.report),
    brand: typeof args.brand === "string" ? args.brand : undefined,
    letter: typeof args.letter === "string" ? args.letter.toUpperCase() : undefined,
  };
}

function readJson(fp: string): Record<string, any> | null {
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); } catch { return null; }
}

function shouldProcess(
  folder: string,
  carJson: Record<string, any> | null,
  args: RepairArgs
): boolean {
  if (args.all && !args.brand && !args.letter) return true;

  if (args.letter) {
    const rel = path.relative(args.root, folder);
    const firstSegment = rel.split(path.sep)[0];
    if (firstSegment.toUpperCase() !== args.letter) return false;
  }

  if (args.brand) {
    const brand = carJson?.brand as string | undefined;
    if (!brand || brand.toLowerCase() !== args.brand!.toLowerCase()) return false;
  }

  if (args.keys.size > 0) {
    const nk = carJson && typeof carJson.normalizedKey === "string"
      ? carJson.normalizedKey : null;
    if (!nk || !args.keys.has(nk)) return false;
  }

  return true;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args) {
    console.error(
      "Usage:\n" +
      "  --root <seeds/cars path>  (required)\n" +
      "  --keys=a,b,c              target specific normalizedKeys\n" +
      "  --all                     target all car folders\n" +
      "  --brand=Lotus             target all cars for a brand\n" +
      "  --letter=L                target all cars under a letter folder\n" +
      "  --dry                     preview only\n" +
      "  --report                  report issues only, no fixes\n" +
      "  --verbose                 show skipped files too\n"
    );
    process.exit(1);
  }

  const hasTarget = args.all || args.keys.size > 0 ||
    args.brand !== undefined || args.letter !== undefined;

  if (!hasTarget) {
    console.error("Provide --all, --keys=a,b,c, --brand=X, or --letter=X");
    process.exit(1);
  }

  const dry = args.dry || args.report;

  console.log(`🔍 Root: ${args.root}`);

  const modeParts: string[] = [];
  if (args.all && !args.brand && !args.letter) modeParts.push("ALL");
  if (args.letter) modeParts.push(`Letter: ${args.letter}`);
  if (args.brand) modeParts.push(`Brand: ${args.brand}`);
  if (args.keys.size > 0) modeParts.push(`Keys: ${[...args.keys].join(", ")}`);
  console.log(`🧪 Mode: ${modeParts.join(" | ")} | Dry: ${dry} | Report: ${args.report}`);

  const folders = findCarFolders(args.root);
  let scanned = 0;
  let totalFixed = 0;
  let totalIssues = 0;

  for (const folder of folders) {
    const carJson = readJson(path.join(folder, "car.json"));
    if (!shouldProcess(folder, carJson, args)) continue;

    scanned++;
    const { fixed, issues } = repairCarFolder(folder, dry, args.verbose);
    totalFixed += fixed;
    totalIssues += issues.length;
  }

  console.log("\n📊 Summary:");
  console.log(`  Scanned:  ${scanned}`);
  console.log(`  Fixed:    ${totalFixed}${dry ? " (dry-run)" : ""}`);
  console.log(`  Issues:   ${totalIssues}`);

  if (dry && !args.report && totalFixed > 0) {
    console.log("\nℹ️  Dry-run only. Re-run without --dry to apply.");
  }
}

main();