import fs from 'fs';
import path from 'path';

export function findCarFolder(normalizedKey: string, carsRoot: string): string | null {
  const letters = fs.readdirSync(carsRoot);
  for (const letter of letters) {
    const letterPath = path.join(carsRoot, letter);
    if (!fs.statSync(letterPath).isDirectory()) continue;
    const brands = fs.readdirSync(letterPath);
    for (const brand of brands) {
      const brandPath = path.join(letterPath, brand);
      if (!fs.statSync(brandPath).isDirectory()) continue;
      const classes = fs.readdirSync(brandPath);
      for (const cls of classes) {
        const clsPath = path.join(brandPath, cls);
        if (!fs.statSync(clsPath).isDirectory()) continue;
        const models = fs.readdirSync(clsPath);
        for (const model of models) {
          const carPath = path.join(clsPath, model);
          const carJsonPath = path.join(carPath, 'car.json');
          if (!fs.existsSync(carJsonPath)) continue;
          try {
            const carJson = JSON.parse(fs.readFileSync(carJsonPath, 'utf-8'));
            if (carJson.normalizedKey === normalizedKey) return carPath;
          } catch {
            // skip malformed car.json
          }
        }
      }
    }
  }
  return null;
}

export function writeJson(filePath: string, data: unknown, dry: boolean): void {
  if (dry) {
    console.log(`  [DRY] Would write: ${filePath}`);
    console.log(`  ${JSON.stringify(data, null, 2).slice(0, 300)}...`);
    return;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  ✓ Written: ${filePath}`);
}