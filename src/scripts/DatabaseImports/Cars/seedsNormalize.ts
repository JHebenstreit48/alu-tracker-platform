import fs from "node:fs";
import path from "node:path";

import { SEED_CAR_KEY_ORDER } from "@/scripts/DatabaseImports/Cars/seedKeyOrder";

const ROOT = path.resolve(process.cwd(), "src/seeds/Cars");
const APPLY = process.argv.includes("--apply");

const REPORT_DIR = path.resolve(process.cwd(), "exports");
const REPORT_FILE = path.join(REPORT_DIR, "seeds-normalize-report.json");

type AnyObj = Record<string, any>;

function* walkJson(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walkJson(full);
    else if (e.isFile() && /\.json$/i.test(e.name)) yield full;
  }
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file: string, obj: unknown): void {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
}

function normalizeRoot(raw: unknown): AnyObj {
  // supports legacy "[ { ... } ]" format
  if (Array.isArray(raw)) {
    if (raw.length === 1 && raw[0] && typeof raw[0] === "object" && !Array.isArray(raw[0])) {
      return raw[0] as AnyObj;
    }
    throw new Error("Array root with multiple entries (split file first).");
  }
  if (raw && typeof raw === "object") return raw as AnyObj;
  throw new Error("Not an object JSON.");
}

function reorderKeys(obj: AnyObj): AnyObj {
  const out: AnyObj = {};

  // 1) ordered keys first (canonical)
  for (const k of SEED_CAR_KEY_ORDER) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      out[k] = obj[k];
    }
  }

  // 2) then everything else in existing order (unknown keys)
  for (const k of Object.keys(obj)) {
    if (!Object.prototype.hasOwnProperty.call(out, k)) {
      out[k] = obj[k];
    }
  }

  return out;
}

function run() {
  const files = Array.from(walkJson(ROOT));
  const report: Array<{ file: string; status: string; reason?: string }> = [];

  let wouldChange = 0;
  let changed = 0;

  for (const f of files) {
    try {
      const raw = readJson(f);
      const obj = normalizeRoot(raw);
      const next = reorderKeys(obj);

      const beforeStr = JSON.stringify(obj);
      const nextStr = JSON.stringify(next);

      // If original file was array-root, we treat it as a change even if order matches
      const shouldChange = beforeStr !== nextStr || Array.isArray(raw);

      if (shouldChange) {
        wouldChange++;
        report.push({ file: f, status: APPLY ? "changed" : "would-change" });

        if (APPLY) {
          writeJson(f, next);
          changed++;
        }
      } else {
        report.push({ file: f, status: "ok" });
      }
    } catch (e: any) {
      report.push({ file: f, status: "error", reason: e?.message ?? String(e) });
    }
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2) + "\n");

  console.log(`✅ seedsNormalize complete`);
  console.log(`📁 scanned: ${files.length}`);
  console.log(`🧾 wouldChange: ${wouldChange}`);
  console.log(`✍️ changed: ${changed}`);
  console.log(`📄 report: ${REPORT_FILE}`);
}

run();