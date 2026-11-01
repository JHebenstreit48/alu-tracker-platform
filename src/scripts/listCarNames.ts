import fs from "fs";
import path from "path";

// npm runs scripts from the repo root, so these paths work wherever this file lives
const ROOT = path.resolve(process.cwd(), "src/seeds/cars");
const OUTPUT = path.resolve(process.cwd(), "car-names.txt");

interface CarEntry {
  brand: string;
  model: string;
  normalizedKey: string;
  carClass: string;
}

const cars: CarEntry[] = [];
const problems: string[] = [];

function walk(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name === "car.json") {
      const rel = path.relative(ROOT, full);
      try {
        const data = JSON.parse(fs.readFileSync(full, "utf8"));
        if (!data.brand || !data.model || !data.normalizedKey) {
          problems.push(`${rel}  (missing brand, model or normalizedKey)`);
          continue;
        }
        cars.push({
          brand: data.brand,
          model: data.model,
          normalizedKey: data.normalizedKey,
          carClass: data.class ?? "?",
        });
      } catch {
        problems.push(`${rel}  (couldn't read)`);
      }
    }
  }
}

if (!fs.existsSync(ROOT)) {
  console.error(`Cars folder not found: ${ROOT}`);
  process.exit(1);
}

walk(ROOT);

cars.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));

const lines = cars.map((c) => `${c.brand} ${c.model} | ${c.normalizedKey} | Class ${c.carClass}`);
fs.writeFileSync(OUTPUT, lines.join("\n"));

console.log(`Done: ${cars.length} cars written to car-names.txt`);
if (problems.length) console.log(`Problems in ${problems.length} file(s):\n  ` + problems.join("\n  "));