import fs from 'fs';
import path from 'path';

const SEEDS_ROOT = path.join(__dirname, '../../seeds/cars');

interface MissingEntry {
  file: string;
  brand: string;
  model: string;
}

const results = {
  total: 0,
  hasKey: 0,
  missingKey: [] as MissingEntry[],
};

function isCarJson(filePath: string): boolean {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return (
      typeof data.id !== 'undefined' &&
      typeof data.class !== 'undefined' &&
      typeof data.brand !== 'undefined' &&
      typeof data.model !== 'undefined'
    );
  } catch {
    return false;
  }
}

function walk(currentDir: string): void {
  let entries;
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      const isNewFormat = entry.name === 'car.json';
      const isOldFormat = !isNewFormat && isCarJson(fullPath);

      if (isNewFormat || isOldFormat) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          results.total++;

          if (!data.normalizedKey) {
            results.missingKey.push({
              file: path.relative(SEEDS_ROOT, fullPath),
              brand: data.brand ?? '(unknown)',
              model: data.model ?? '(unknown)',
            });
          } else {
            results.hasKey++;
          }
        } catch (err: any) {
          console.warn(`  ⚠ Could not parse: ${fullPath} — ${err.message}`);
        }
      }
    }
  }
}

if (!fs.existsSync(SEEDS_ROOT)) {
  console.error(`❌  Could not find: ${SEEDS_ROOT}`);
  process.exit(1);
}

console.log(`\nScanning: ${SEEDS_ROOT}\n`);
walk(SEEDS_ROOT);

if (results.missingKey.length === 0) {
  console.log('✅  All car files have a normalizedKey!');
} else {
  console.log(`📋  Cars missing normalizedKey (${results.missingKey.length}):\n`);
  for (const car of results.missingKey) {
    console.log(`  ✗  ${car.brand} — ${car.model}`);
    console.log(`     ${car.file}\n`);
  }
}

console.log('─'.repeat(50));
console.log(`  Total car files found : ${results.total}`);
console.log(`  Have normalizedKey    : ${results.hasKey}`);
console.log(`  Missing normalizedKey : ${results.missingKey.length}`);
console.log('─'.repeat(50) + '\n');