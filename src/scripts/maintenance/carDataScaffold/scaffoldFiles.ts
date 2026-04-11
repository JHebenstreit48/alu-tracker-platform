import * as fs from "node:fs";
import * as path from "node:path";
import type { CarMeta, ScaffoldResult } from "@/types/scripts/maintenance/scaffoldCar/index";
import { generateTemplates, isDataFile, isOutdated } from "@/scripts/maintenance/carDataScaffold/scaffoldTemplates";

export function readJson(fp: string): Record<string, any> | null {
  try {
    return JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch {
    return null;
  }
}

export function readFile(fp: string): string | null {
  try {
    return fs.readFileSync(fp, "utf8");
  } catch {
    return null;
  }
}

export function writeFile(
  fp: string,
  content: string,
  dry: boolean,
  verbose: boolean
): boolean {
  if (fs.existsSync(fp)) {
    if (verbose) console.log(`  [exists] ${fp}`);
    return false;
  }
  if (dry) {
    console.log(`  [dry] would create: ${fp}`);
    return true;
  }
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content, "utf8");
  console.log(`  [created] ${fp}`);
  return true;
}

export function fixFile(
  fp: string,
  content: string,
  dry: boolean
): boolean {
  if (dry) {
    console.log(`  [dry] would fix: ${fp}`);
    return true;
  }
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content, "utf8");
  console.log(`  [fixed] ${fp}`);
  return true;
}

export function findCarFolders(root: string): string[] {
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

export function resolveCarMeta(folder: string, root: string): CarMeta | null {
  const carJson = readJson(path.join(folder, "car.json"));
  if (!carJson) return null;

  const rel = path.relative(root, folder).split(path.sep);
  const letter = rel[0] ?? "A";
  const brand = rel[1] ?? "Unknown";
  const klass = rel[2] ?? "A";
  const model = rel[3] ?? "Unknown";

  const normalizedKey =
    typeof carJson.normalizedKey === "string" ? carJson.normalizedKey : "";
  const stars = (carJson.stars as number) ?? 5;

  const relFromCars = path.relative(root, folder).split(path.sep).join("/");
  const alias = `@/seeds/cars/${relFromCars}`;

  return {
    normalizedKey,
    stars: Math.min(Math.max(stars, 3), 6) as CarMeta["stars"],
    brand,
    klass,
    model,
    letter,
    alias,
  };
}

export function scaffoldCarFolder(
  folder: string,
  root: string,
  dry: boolean,
  verbose: boolean,
  fix: boolean
): ScaffoldResult {
  const meta = resolveCarMeta(folder, root);
  if (!meta) return { key: path.basename(folder), created: 0, fixed: 0 };

  console.log(`\n🚗 ${meta.normalizedKey} (${meta.stars}★)`);

  const templates = generateTemplates(meta);
  let created = 0;
  let fixed = 0;

  for (const [relPath, content] of Object.entries(templates)) {
    const fp = path.join(folder, relPath);
    const exists = fs.existsSync(fp);

    if (!exists) {
      if (writeFile(fp, content, dry, verbose)) created++;
      continue;
    }

    if (fix && !isDataFile(relPath)) {
      const current = readFile(fp);
      if (current !== null && isOutdated(relPath, current)) {
        if (fixFile(fp, content, dry)) fixed++;
      } else if (verbose) {
        console.log(`  [ok] ${relPath}`);
      }
    } else if (verbose) {
      console.log(`  [exists] ${relPath}`);
    }
  }

  return { key: meta.normalizedKey, created, fixed };
}