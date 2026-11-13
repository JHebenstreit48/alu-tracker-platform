import fs from 'fs';
import path from 'path';

const SEEDS_DIR = path.resolve(__dirname, '../../seeds/cars');

type Bucket = 'missing' | 'oldFormat' | 'newFormat';

/** Every car.json under the seeds folder. */
function findCarFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findCarFiles(full);
    return entry.name === 'car.json' ? [full] : [];
  });
}

function isGroupedEntry(value: unknown): boolean {
  return typeof value === 'object' && value !== null && 'status' in value && 'methods' in value;
}

/** Which bucket a car's obtainableVia falls into. */
function classify(value: unknown): Bucket {
  if (value === undefined || value === null || value === '') return 'missing';
  if (typeof value === 'string') return 'oldFormat';
  if (!Array.isArray(value) || value.length === 0) return 'missing';
  return value.every(isGroupedEntry) ? 'newFormat' : 'oldFormat';
}

function main() {
  const files = findCarFiles(SEEDS_DIR);
  const buckets: Record<Bucket, string[]> = { missing: [], oldFormat: [], newFormat: [] };

  for (const file of files) {
    const data: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
    const value =
      typeof data === 'object' && data !== null
        ? (data as Record<string, unknown>).obtainableVia
        : undefined;
    buckets[classify(value)].push(path.relative(SEEDS_DIR, file));
  }

  console.log(`Checked ${files.length} cars`);
  console.log(`  New format: ${buckets.newFormat.length}`);
  console.log(`  Old format: ${buckets.oldFormat.length}`);
  console.log(`  Missing:    ${buckets.missing.length}\n`);

  if (buckets.missing.length) {
    console.log('Missing obtainableVia:');
    buckets.missing.forEach((file) => console.log(`  ${file}`));
  }
}

main();