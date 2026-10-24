import * as fs from 'fs';
import * as path from 'path';

const args: Record<string, string | boolean> = Object.fromEntries(
  process.argv.slice(2).map((a): [string, string | boolean] => {
    const [key, value] = a.replace(/^--/, '').split('=');
    return [key, value === undefined ? true : value];
  })
);

const root =
  typeof args.dir === 'string'
    ? path.resolve(process.cwd(), args.dir)
    : path.resolve(__dirname, '../../seeds/cars');
const size = Number(args.size) || 100;
const page = Number(args.page) || 1;

if (!fs.existsSync(root)) {
  console.error(`Folder not found: ${root}`);
  process.exit(1);
}

function findCarJson(dir: string, found: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findCarJson(full, found);
    else if (entry.name === 'car.json') found.push(full);
  }
  return found;
}

function isOldFormat(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) return true;
  return value.some((item) => typeof item === 'string');
}

interface Row {
  brand: string;
  model: string;
  old: boolean;
}

const errors: string[] = [];
let cars: Row[] = [];

for (const file of findCarJson(root)) {
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    cars.push({
      brand: json.brand || '(no brand)',
      model: json.model || '(no model)',
      old: isOldFormat(json.obtainableVia),
    });
  } catch (err) {
    errors.push(`${path.relative(root, file)}: ${(err as Error).message}`);
  }
}

cars.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));

if (args.old) cars = cars.filter((c) => c.old);

const lines = cars.map((c) => `${c.brand} - ${c.model}`);
const total = lines.length;
const pages = Math.max(1, Math.ceil(total / size));

console.log(args.old ? `Cars with null/empty/old obtainableVia: ${total}` : `Total cars: ${total}`);

if (args.all) {
  console.log(`Showing all ${total}\n`);
  console.log(lines.join('\n'));
} else {
  const start = (page - 1) * size;
  const end = Math.min(start + size, total);
  console.log(`Showing ${total ? start + 1 : 0}-${end} of ${total} (page ${page} of ${pages})\n`);
  console.log(lines.slice(start, end).join('\n'));
  if (page < pages) console.log(`\n-> next: add --page=${page + 1}`);
}

if (typeof args.out === 'string') {
  fs.writeFileSync(path.resolve(process.cwd(), args.out), lines.join('\n') + '\n');
  console.log(`\nSaved ${total} lines to ${args.out}`);
}

if (errors.length) {
  console.log(`\n${errors.length} car.json file(s) could not be read:`);
  errors.forEach((e) => console.log('  ' + e));
}