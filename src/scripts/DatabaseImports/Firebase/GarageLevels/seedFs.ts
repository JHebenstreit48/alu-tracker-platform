import fs from "fs";
import path from "path";
import { ROOT_DIR } from "./seedConfig";

export function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}

// Match original helpers
export const isJson = (f: string): boolean => /\.json$/i.test(f);

export const isCollectorTs = (f: string): boolean =>
  /[/\\]GL\d{1,2}-\d{1,2}\.ts$/i.test(f);

export const isCollectorJson = (f: string): boolean =>
  /[/\\]GL\d{1,2}-\d{1,2}\.json$/i.test(f);

export const isCollector = (f: string): boolean =>
  isCollectorTs(f) || isCollectorJson(f);

// Per-level JSON like gl01.json, gl6.json
export const isPerLevelJson = (f: string): boolean =>
  /[/\\]gl\d{1,2}\.json$/i.test(f);

// Parent folder helper: ".../GarageLevels/GL1-10/GL1-5.ts" -> "GL1-10"
export function parentFolderName(p: string): string | undefined {
  const parts = p.split(path.sep);
  if (parts.length < 2) return undefined;
  return parts[parts.length - 2];
}

export const getAllSeedFiles = (): string[] =>
  Array.from(walk(ROOT_DIR));