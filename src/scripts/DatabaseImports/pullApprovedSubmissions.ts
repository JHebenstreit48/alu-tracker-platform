import "dotenv/config";
import fs from "fs";
import path from "path";
import { adminDb } from "@/Firebase/firebaseAdmin";

const DRY = process.argv.includes("--dry");
const CARS_ROOT = path.resolve(__dirname, "../../seeds/cars");
const COLL = "carSubmissions";

// ─── Types ────────────────────────────────────────────────────────────────

interface StarStatBlock {
  rank?: number;
  topSpeed?: number;
  acceleration?: number;
  handling?: number;
  nitro?: number;
}

interface CarStatsPatch {
  stock?: StarStatBlock;
  maxAtStar?: {
    oneStar?: StarStatBlock;
    twoStar?: StarStatBlock;
    threeStar?: StarStatBlock;
    fourStar?: StarStatBlock;
    fiveStar?: StarStatBlock;
    sixStar?: StarStatBlock;
  };
  gold?: StarStatBlock;
  blueprints?: Record<string, unknown>;
}

interface CarPatch {
  brand?: string;
  model?: string;
  class?: string;
  rarity?: string;
  stars?: number;
  country?: string;
  keyCar?: boolean;
  stats?: CarStatsPatch;
}

interface Submission {
  id: string;
  cars: Record<string, CarPatch>;
  submitterUsername: string;
  submitterNote?: string;
  status: string;
}

// ─── Find car folder by normalizedKey ─────────────────────────────────────

function findCarFolder(normalizedKey: string): string | null {
  const letters = fs.readdirSync(CARS_ROOT);

  for (const letter of letters) {
    const letterPath = path.join(CARS_ROOT, letter);
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
          const carJsonPath = path.join(carPath, "car.json");
          if (!fs.existsSync(carJsonPath)) continue;

          try {
            const carJson = JSON.parse(fs.readFileSync(carJsonPath, "utf-8"));
            if (carJson.normalizedKey === normalizedKey) {
              return carPath;
            }
          } catch {
            // skip malformed car.json
          }
        }
      }
    }
  }

  return null;
}

// ─── Write JSON helper ─────────────────────────────────────────────────────

function writeJson(filePath: string, data: unknown) {
  if (DRY) {
    console.log(`  [DRY] Would write: ${filePath}`);
    console.log(`  ${JSON.stringify(data, null, 2).slice(0, 300)}...`);
    return;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  ✓ Written: ${filePath}`);
}

// ─── Deep merge two CarPatch objects ──────────────────────────────────────

function mergePatch(base: CarPatch, incoming: CarPatch): CarPatch {
  const merged: CarPatch = { ...base };

  // Identity fields — incoming wins
  const identityFields = [
    "brand", "model", "class", "rarity",
    "stars", "country", "keyCar",
  ] as const;
  for (const field of identityFields) {
    if (incoming[field] !== undefined) {
      (merged as any)[field] = incoming[field];
    }
  }

  // Stats — deep merge
  if (incoming.stats) {
    merged.stats = merged.stats || {};

    // stock — incoming wins
    if (incoming.stats.stock) {
      merged.stats.stock = {
        ...(merged.stats.stock || {}),
        ...incoming.stats.stock,
      };
    }

    // gold — incoming wins
    if (incoming.stats.gold) {
      merged.stats.gold = {
        ...(merged.stats.gold || {}),
        ...incoming.stats.gold,
      };
    }

    // maxAtStar — merge per star key
    if (incoming.stats.maxAtStar) {
      merged.stats.maxAtStar = merged.stats.maxAtStar || {};
      const starKeys = [
        "oneStar", "twoStar", "threeStar",
        "fourStar", "fiveStar", "sixStar",
      ] as const;
      for (const key of starKeys) {
        if (incoming.stats.maxAtStar[key]) {
          merged.stats.maxAtStar[key] = {
            ...(merged.stats.maxAtStar[key] || {}),
            ...incoming.stats.maxAtStar[key],
          };
        }
      }
    }

    // blueprints — merge per star key
    if (incoming.stats.blueprints) {
      merged.stats.blueprints = {
        ...(merged.stats.blueprints || {}),
        ...incoming.stats.blueprints,
      };
    }
  }

  return merged;
}

// ─── Apply merged patch to car files ──────────────────────────────────────

function applyPatch(carFolder: string, normalizedKey: string, patch: CarPatch) {
  console.log(`\n  Applying merged patch to: ${normalizedKey}`);

  // --- car.json identity fields ---
  const carJsonPath = path.join(carFolder, "car.json");
  const carJson = JSON.parse(fs.readFileSync(carJsonPath, "utf-8"));

  let carJsonChanged = false;
  const identityFields = [
    "brand", "model", "class", "rarity",
    "stars", "country", "keyCar",
  ] as const;
  for (const field of identityFields) {
    if (patch[field] !== undefined) {
      carJson[field] = patch[field];
      carJsonChanged = true;
      console.log(`  → car.json: ${field} = ${patch[field]}`);
    }
  }
  if (carJsonChanged) writeJson(carJsonPath, carJson);

  // --- blueprints in car.json ---
  if (patch.stats?.blueprints) {
    const bp = patch.stats.blueprints;
    const bpMap: Record<string, string> = {
      oneStar: "blueprints1Star",
      twoStar: "blueprints2Star",
      threeStar: "blueprints3Star",
      fourStar: "blueprints4Star",
      fiveStar: "blueprints5Star",
      sixStar: "blueprints6Star",
    };
    let bpChanged = false;
    for (const [key, jsonKey] of Object.entries(bpMap)) {
      if (bp[key] !== undefined) {
        carJson[jsonKey] = bp[key];
        bpChanged = true;
        console.log(`  → car.json: ${jsonKey} = ${bp[key]}`);
      }
    }
    if (bpChanged) writeJson(carJsonPath, carJson);
  }

  // --- stats/stock.json ---
  if (patch.stats?.stock) {
    const stockPath = path.join(carFolder, "stats", "stock.json");
    if (fs.existsSync(stockPath)) {
      const existing = JSON.parse(fs.readFileSync(stockPath, "utf-8"));
      // Only overwrite non-zero values from patch
      const merged: StarStatBlock = { ...existing.stock };
      for (const [k, v] of Object.entries(patch.stats.stock)) {
        if (v !== undefined && v !== 0) {
          (merged as any)[k] = v;
        }
      }
      console.log(`  → stats/stock.json`);
      writeJson(stockPath, { stock: merged });
    } else {
      console.warn(`  ⚠ stats/stock.json not found for ${normalizedKey}`);
    }
  }

  // --- stats/maxStar.json ---
  if (patch.stats?.maxAtStar) {
    const maxStarPath = path.join(carFolder, "stats", "maxStar.json");
    const existing = fs.existsSync(maxStarPath)
      ? JSON.parse(fs.readFileSync(maxStarPath, "utf-8"))
      : {};

    const starKeys = [
      "oneStar", "twoStar", "threeStar",
      "fourStar", "fiveStar", "sixStar",
    ] as const;

    for (const key of starKeys) {
      const incoming = patch.stats.maxAtStar[key];
      if (!incoming) continue;

      // Only overwrite non-zero values
      const existingBlock = existing[key] || {};
      const mergedBlock: StarStatBlock = { ...existingBlock };
      for (const [k, v] of Object.entries(incoming)) {
        if (v !== undefined && v !== 0) {
          (mergedBlock as any)[k] = v;
        }
      }
      existing[key] = mergedBlock;
      console.log(`  → stats/maxStar.json: ${key}`);
    }

    writeJson(maxStarPath, existing);
  }

  // --- stats/gold.json ---
  if (patch.stats?.gold) {
    const goldPath = path.join(carFolder, "stats", "gold.json");
    if (fs.existsSync(goldPath)) {
      const existing = JSON.parse(fs.readFileSync(goldPath, "utf-8"));
      // Only overwrite non-zero values
      const merged: StarStatBlock = { ...existing.gold };
      for (const [k, v] of Object.entries(patch.stats.gold)) {
        if (v !== undefined && v !== 0) {
          (merged as any)[k] = v;
        }
      }
      console.log(`  → stats/gold.json`);
      writeJson(goldPath, { gold: merged });
    } else {
      console.warn(`  ⚠ stats/gold.json not found for ${normalizedKey}`);
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n──────────────────────────────────────────────────");
  console.log(`  Pull Approved Submissions ${DRY ? "(DRY RUN)" : "(LIVE)"}`);
  console.log("──────────────────────────────────────────────────\n");

  const snap = await adminDb
    .collection(COLL)
    .where("status", "==", "approved")
    .get();

  if (snap.empty) {
    console.log("  No approved submissions found.");
    console.log("\n──────────────────────────────────────────────────\n");
    return;
  }

  console.log(`  Found ${snap.docs.length} approved submission(s)\n`);

  // ── Step 1: Merge all submissions per normalizedKey ──────────────────────
  const mergedPatches: Record<string, CarPatch> = {};
  const submissionIds: string[] = [];
  const submissionMeta: { id: string; username: string; note?: string }[] = [];

  for (const doc of snap.docs) {
    const submission = { id: doc.id, ...doc.data() } as Submission;
    submissionIds.push(submission.id);
    submissionMeta.push({
      id: submission.id,
      username: submission.submitterUsername,
      note: submission.submitterNote,
    });

    console.log(`● Submission: ${submission.id}`);
    console.log(`  By: ${submission.submitterUsername}`);
    console.log(`  Cars: ${Object.keys(submission.cars).join(", ")}`);
    if (submission.submitterNote) {
      console.log(`  Note: ${submission.submitterNote}`);
    }

    for (const [normalizedKey, patch] of Object.entries(submission.cars)) {
      if (!mergedPatches[normalizedKey]) {
        mergedPatches[normalizedKey] = {};
      }
      mergedPatches[normalizedKey] = mergePatch(
        mergedPatches[normalizedKey],
        patch
      );
    }
  }

  // ── Step 2: Apply merged patch per car ───────────────────────────────────
  console.log(`\n  Merged into ${Object.keys(mergedPatches).length} unique car(s) to update\n`);

  let applied = 0;
  let notFound = 0;

  for (const [normalizedKey, patch] of Object.entries(mergedPatches)) {
    const carFolder = findCarFolder(normalizedKey);

    if (!carFolder) {
      console.warn(`  ⚠ Car not found for normalizedKey: ${normalizedKey}`);
      notFound++;
      continue;
    }

    applyPatch(carFolder, normalizedKey, patch);
    applied++;
  }

  // ── Step 3: Mark all submissions as imported ──────────────────────────────
  for (const meta of submissionMeta) {
    if (!DRY) {
      await adminDb.collection(COLL).doc(meta.id).update({
        status: "imported",
        importedAt: new Date().toISOString(),
      });
      console.log(`\n  ✓ Marked as imported: ${meta.id}`);
    } else {
      console.log(`\n  [DRY] Would mark as imported: ${meta.id}`);
    }
  }

  console.log("\n──────────────────────────────────────────────────");
  console.log(`  Cars applied  : ${applied}`);
  console.log(`  Cars not found: ${notFound}`);
  if (DRY) console.log("\n  Run without --dry to apply changes.");
  console.log("──────────────────────────────────────────────────\n");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});