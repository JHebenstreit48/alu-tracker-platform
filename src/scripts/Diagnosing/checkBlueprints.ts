import fs from 'fs';
import path from 'path';

const SEEDS_DIR = path.resolve(__dirname, '../../seeds/cars');
const MAX_STARS = 6;

type CarData = Record<string, unknown>;

/** Every car.json under the seeds folder. */
function findCarFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findCarFiles(full);
    return entry.name === 'car.json' ? [full] : [];
  });
}

/** Problems with one car's blueprint fields, e.g. "3★ missing", "1★ zero", "6★ extra". */
function checkCar(car: CarData): string[] {
  const stars = typeof car.stars === 'number' ? car.stars : 0;
  if (stars < 1) return ['stars missing'];

  const isKeyCar = car.keyCar === true;
  const problems: string[] = [];

  for (let star = 1; star <= MAX_STARS; star++) {
    const value = car[`blueprints${star}Star`];
    if (star > stars) {
      if (value !== undefined) problems.push(`${star}★ extra`);
      continue;
    }
    if (typeof value !== 'number') problems.push(`${star}★ missing`);
    else if (value === 0 && !(star === 1 && isKeyCar)) problems.push(`${star}★ zero`);
  }
  return problems;
}

function main() {
  const files = findCarFiles(SEEDS_DIR);
  const results: string[] = [];

  for (const file of files) {
    const data: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
    const car = typeof data === 'object' && data !== null ? (data as CarData) : {};
    const problems = checkCar(car);
    if (problems.length) results.push(`  ${path.relative(SEEDS_DIR, file)}  (${problems.join(', ')})`);
  }

  console.log(`Checked ${files.length} cars`);
  console.log(`  Complete blueprints: ${files.length - results.length}`);
  console.log(`  Missing or wrong:    ${results.length}\n`);
  results.forEach((line) => console.log(line));
}

main();