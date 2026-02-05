import fs from "fs";
import path from "path";
import { ROOT_DIR } from "@/scripts/DatabaseImports/Cars/seedConfig";

export function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}

export const isJson = (f: string): boolean => /\.json$/i.test(f);

export const isTsCollector = (f: string): boolean =>
  /[/\\]Class[A-Z]\.ts$/i.test(f);

/**
 * New-format car folder override:
 * src/seeds/Cars/<Letter>/<Brand>/<Class>/<CarFolder>/index.ts
 */
export const isCarFolderIndexTs = (f: string): boolean =>
  /[/\\]Cars[/\\][^/\\]+[/\\][^/\\]+[/\\][A-DSa-ds][\/\\][^/\\]+[/\\]index\.ts$/i.test(
    f
  );

export function parseBrandAndClass(
  file: string
): { brand?: string; klass?: string } {
  const parts = file.split(path.sep);
  const i = parts.lastIndexOf("Cars");
  if (i < 0) return {};

  // Structure:
  // src/seeds/Cars/<Letter>/<Brand>/.../file
  const brand = parts[i + 2];
  let klass: string | undefined;

  const base = path.basename(file).toLowerCase();
  const m = base.match(/^class([a-z])\./i);
  if (m) {
    klass = m[1].toUpperCase();
  } else {
    const folder = parts[i + 3];
    if (folder && /^[A-D|S]$/i.test(folder)) {
      klass = folder.toUpperCase();
    }
  }

  return { brand, klass };
}

export const getAllSeedFiles = (): string[] =>
  Array.from(walk(ROOT_DIR)).filter(
    (f) => isJson(f) || isTsCollector(f) || isCarFolderIndexTs(f)
  );