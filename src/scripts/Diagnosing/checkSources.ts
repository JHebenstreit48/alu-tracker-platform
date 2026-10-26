import * as fs from "fs";
import * as path from "path";

// Keep in sync with the front-end sourcesCatalog (aliases and prefixes only).
const knownExact = [
  "MEI",
  "Community spreadsheet",
  "Community research posts",
  "Discord",
  "Official patch notes",
  "Patch Notes video",
  "My own in-game research",
  "Asphalt Fandom Wiki",
  "asphalt9.info",
  "Gameloft newsroom",
];

const knownPrefixes = ["Nox Fury", "GamingWithAwesome", "Tune, Race, Repeat!"];

const root = path.resolve(__dirname, "../../seeds/cars");

function findCarJson(dir: string, found: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findCarJson(full, found);
    else if (entry.name === "car.json") found.push(full);
  }
  return found;
}

function isKnown(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    knownExact.some((a) => a.toLowerCase() === v) ||
    knownPrefixes.some((p) => v.startsWith(p.toLowerCase()))
  );
}

const problems: string[] = [];
let checked = 0;

for (const file of findCarJson(root)) {
  const rel = path.relative(root, file);
  let json: { sources?: unknown };
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    problems.push(`${rel}: cannot read (${(err as Error).message})`);
    continue;
  }
  checked++;

  if (!Array.isArray(json.sources) || json.sources.length === 0) {
    problems.push(`${rel}: no sources`);
    continue;
  }

  const seen = new Set<string>();
  for (const s of json.sources) {
    if (typeof s !== "string") {
      problems.push(`${rel}: non-string source`);
      continue;
    }
    if (!isKnown(s)) problems.push(`${rel}: unknown source "${s}"`);
    if (seen.has(s)) problems.push(`${rel}: duplicate source "${s}"`);
    seen.add(s);
  }
}

console.log(`Checked ${checked} cars`);
if (problems.length) {
  console.log(`${problems.length} problem(s):\n`);
  problems.forEach((p) => console.log("  " + p));
  process.exitCode = 1;
} else {
  console.log("All sources match the allow-list.");
}