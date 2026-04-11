import path from 'path';
import { findCarJsonFiles, findPartialCarFolders } from '@/utils/scripts/maintenance/convertToNewFormat/finders';
import { convertCar } from '@/utils/scripts/maintenance/convertToNewFormat/converter';
import type { FilterFn } from '@/types/scripts/maintenance/convertToNewFormat';

const SEEDS_ROOT = path.join(__dirname, '../../seeds/cars');

function getArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const dry = hasFlag('dry');
const allFlag = hasFlag('all');
const keysArg = getArg('keys');
const brandArg = getArg('brand');
const letterArg = getArg('letter');

if (!keysArg && !brandArg && !letterArg && !allFlag) {
  console.error('❌ Provide at least one filter:');
  console.error('   --keys=<normalizedKey1,normalizedKey2>');
  console.error('   --brand=<BrandName>');
  console.error('   --letter=<A-Z>');
  console.error('   --all  (scan entire seeds folder)');
  console.error('   --dry  (add to any command to preview without writing files)');
  process.exit(1);
}

let filterFn: FilterFn;

if (allFlag) {
  filterFn = () => true;
  console.log(`\n🌐 Scanning ALL cars`);
} else if (keysArg) {
  const keys = new Set(keysArg.split(',').map((s) => s.trim()));
  filterFn = (_, data) => keys.has(data.normalizedKey ?? '');
  console.log(`\n🔑 Filtering by normalizedKey: ${[...keys].join(', ')}`);
} else if (brandArg) {
  const brand = brandArg.trim();
  filterFn = (_, data) => data.brand?.replace(/\s/g, '') === brand.replace(/\s/g, '');
  console.log(`\n🏭 Filtering by brand: ${brand}`);
} else {
  const letter = letterArg!.trim().toUpperCase();
  filterFn = (filePath) => {
    const rel = path.relative(SEEDS_ROOT, filePath);
    return rel.startsWith(letter + path.sep) || rel.startsWith(letter + '/');
  };
  console.log(`\n🔤 Filtering by letter: ${letter}`);
}

const flatFiles = findCarJsonFiles(SEEDS_ROOT, filterFn);
const partialFiles = findPartialCarFolders(SEEDS_ROOT, filterFn);
const allFiles = [...new Set([...flatFiles, ...partialFiles])];

if (allFiles.length === 0) {
  console.log('⚠ No matching old-format or partially converted car files found.');
  process.exit(0);
}

console.log(`\n📋 Found ${allFiles.length} car(s) to convert${dry ? ' [DRY RUN]' : ''}:`);
for (const f of allFiles) console.log(`   ${path.relative(SEEDS_ROOT, f)}`);

for (const f of allFiles) convertCar(SEEDS_ROOT, f, dry);

console.log(`\n✅ Conversion complete — ${allFiles.length} car(s) processed${dry ? ' (dry run, no files written)' : ''}.`);