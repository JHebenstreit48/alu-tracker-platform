import fs from 'fs';
import path from 'path';

const SEEDS_DIR = path.resolve(__dirname, '../../seeds/cars');
const STAT_FILES = ['stock.json', 'maxStar.json', 'gold.json'] as const;

type StatFile = (typeof STAT_FILES)[number];

/** Every car folder (a folder containing car.json). */
function findCarFolders(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const here = entries.some((entry) => entry.isFile() && entry.name === 'car.json') ? [dir] : [];
  const below = entries
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => findCarFolders(path.join(dir, entry.name)));
  return [...here, ...below];
}

/** True if the value holds at least one number other than 0. */
function hasRealNumber(value: unknown): boolean {
  if (typeof value === 'number') return value !== 0;
  if (Array.isArray(value)) return value.some(hasRealNumber);
  if (typeof value === 'object' && value !== null) return Object.values(value).some(hasRealNumber);
  return false;
}

/** "missing" (no file), "empty" (no real numbers) or null (has data). */
function checkFile(carFolder: string, file: StatFile): 'missing' | 'empty' | null {
  const fullPath = path.join(carFolder, 'stats', file);
  if (!fs.existsSync(fullPath)) return 'missing';
  try {
    return hasRealNumber(JSON.parse(fs.readFileSync(fullPath, 'utf8'))) ? null : 'empty';
  } catch {
    return 'empty';
  }
}

function main() {
  const folders = findCarFolders(SEEDS_DIR);
  const problems: string[] = [];

  for (const folder of folders) {
    const issues = STAT_FILES.flatMap((file) => {
      const result = checkFile(folder, file);
      return result ? [`${file.replace('.json', '')} ${result}`] : [];
    });
    if (issues.length) problems.push(`  ${path.relative(SEEDS_DIR, folder)}  (${issues.join(', ')})`);
  }

  console.log(`Checked ${folders.length} cars`);
  console.log(`  Complete main stats: ${folders.length - problems.length}`);
  console.log(`  Missing or empty: ${problems.length}\n`);
  problems.forEach((line) => console.log(line));
}

main();