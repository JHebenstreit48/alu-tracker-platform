import fs from "fs";
import path from "path";

const APPLY = process.argv.includes("--apply");
const CARS_ROOT = path.resolve(__dirname, "../../seeds/cars");

const STAR_FILES = [
  "1star.json",
  "2star.json",
  "3star.json",
  "4star.json",
  "5star.json",
  "6star.json",
];

const PLACEHOLDER = (stage: number) => [
  {
    stage,
    rankByStat: {
      topSpeed: 0,
      acceleration: 0,
      handling: 0,
      nitro: 0,
    },
    statByStat: {
      topSpeed: 0,
      acceleration: 0,
      handling: 0,
      nitro: 0,
    },
  },
];

let found = 0;
let filled = 0;
let skipped = 0;

function walkCars(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkCars(full);
    } else if (entry.isFile() && entry.name === "index.ts") {
      const stagesDir = path.join(
        path.dirname(full),
        "..",
        "deltas",
        "stages"
      );
      if (!fs.existsSync(stagesDir)) continue;
      checkStagesDir(stagesDir);
    }
  }
}

function checkStagesDir(stagesDir: string) {
  STAR_FILES.forEach((file, i) => {
    const filePath = path.join(stagesDir, file);
    if (!fs.existsSync(filePath)) return;

    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (raw !== "[]") {
      skipped++;
      return;
    }

    found++;
    const placeholder = PLACEHOLDER(i + 1);
    console.log(`${APPLY ? "Filling" : "Would fill"}: ${filePath}`);

    if (APPLY) {
      fs.writeFileSync(filePath, JSON.stringify(placeholder, null, 2));
      filled++;
    }
  });
}

walkCars(CARS_ROOT);

console.log("\n──────────────────────────────────────────────────");
console.log(`  Empty stage delta files found : ${found}`);
console.log(`  Already have data (skipped)   : ${skipped}`);
if (APPLY) {
  console.log(`  Filled with placeholders      : ${filled}`);
} else {
  console.log(`  Would fill (run with --apply) : ${found}`);
  console.log("\n  Run with --apply to write placeholders.");
}
console.log("──────────────────────────────────────────────────\n");