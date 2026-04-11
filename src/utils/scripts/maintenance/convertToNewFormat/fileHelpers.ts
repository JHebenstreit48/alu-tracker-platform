import fs from 'fs';

export const STAR_NAMES = ['oneStar', 'twoStar', 'threeStar', 'fourStar', 'fiveStar', 'sixStar'];

export const STAGE_CAPS: Record<number, Record<number, number>> = {
  3: { 1: 5, 2: 8, 3: 10 },
  4: { 1: 4, 2: 7, 3: 9, 4: 11 },
  5: { 1: 3, 2: 6, 3: 8, 4: 10, 5: 12 },
  6: { 1: 3, 2: 6, 3: 8, 4: 10, 5: 12, 6: 13 },
};

export function starNumToName(n: number): string {
  return STAR_NAMES[n - 1];
}

export function emptyStatBlock(): Record<string, number> {
  return { rank: 0, topSpeed: 0, acceleration: 0, handling: 0, nitro: 0 };
}

export function isStatBlock(val: unknown): val is Record<string, number> {
  return val !== null && typeof val === 'object' && 'rank' in (val as object);
}

export function buildMaxStar(stars: number): Record<string, unknown> {
  if (stars === 3) {
    return { oneStar: emptyStatBlock(), twoStar: emptyStatBlock() };
  }
  const result: Record<string, unknown> = {};
  for (let i = 1; i <= stars; i++) {
    result[starNumToName(i)] = emptyStatBlock();
  }
  return result;
}

export function buildProgressionCaps(stars: number): Record<string, number> {
  const caps = STAGE_CAPS[stars];
  if (!caps) return {};
  const result: Record<string, number> = {};
  for (const [star, cap] of Object.entries(caps)) {
    result[star] = cap;
  }
  return result;
}

export function getAlias(letterFolder: string, brand: string, carClass: string, carFolder: string): string {
  return `@/seeds/cars/${letterFolder}/${brand}/${carClass}/${carFolder}`;
}

export function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function writeTs(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
}

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}