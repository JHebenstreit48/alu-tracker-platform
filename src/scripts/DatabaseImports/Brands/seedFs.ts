import fs from "fs";
import path from "path";

export const BRANDS_ROOT_DIR = path.resolve(
  process.cwd(),
  "src/seeds/Manufacturers"
);

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && full.toLowerCase().endsWith(".json")) {
      yield full;
    }
  }
}

export const getBrandSeedFiles = (): string[] => [...walk(BRANDS_ROOT_DIR)];