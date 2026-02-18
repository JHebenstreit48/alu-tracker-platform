import "dotenv/config";
import { adminDb } from "@/Firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function getArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : undefined;
}
function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function parseKeys(keysArg?: string): string[] {
  if (!keysArg) return [];
  return keysArg.split(",").map((s) => s.trim()).filter(Boolean);
}

// legacy flat keys to delete (your full list)
const LEGACY_STATS_KEYS = [
  "stockRank",
  "stockTopSpeed",
  "stockAcceleration",
  "stockHandling",
  "stockNitro",

  "oneStarMaxRank",
  "oneStarMaxTopSpeed",
  "oneStarMaxAcceleration",
  "oneStarMaxHandling",
  "oneStarMaxNitro",

  "twoStarMaxRank",
  "twoStarMaxTopSpeed",
  "twoStarMaxAcceleration",
  "twoStarMaxHandling",
  "twoStarMaxNitro",

  "threeStarMaxRank",
  "threeStarMaxTopSpeed",
  "threeStarMaxAcceleration",
  "threeStarMaxHandling",
  "threeStarMaxNitro",

  "fourStarMaxRank",
  "fourStarMaxTopSpeed",
  "fourStarMaxAcceleration",
  "fourStarMaxHandling",
  "fourStarMaxNitro",

  "fiveStarMaxRank",
  "fiveStarMaxTopSpeed",
  "fiveStarMaxAcceleration",
  "fiveStarMaxHandling",
  "fiveStarMaxNitro",

  "sixStarMaxRank",
  "sixStarMaxTopSpeed",
  "sixStarMaxAcceleration",
  "sixStarMaxHandling",
  "sixStarMaxNitro",

  "goldMaxRank",
  "goldTopSpeed",
  "goldAcceleration",
  "goldHandling",
  "goldNitro",
] as const;

type Mode = "keys" | "all";

function isNonEmptyObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x) && Object.keys(x as any).length > 0;
}

async function getTargets(): Promise<Array<{ key: string; data: any }>> {
  const keysArg = getArg("keys") || process.env.SEED_KEYS;
  const keys = parseKeys(keysArg);

  const useAll = hasFlag("all");
  const brandFilter = getArg("brand"); // optional
  const classFilter = getArg("class"); // optional (A,B,C,D,S)
  const limitArg = getArg("limit"); // optional safety cap
  const limit = limitArg ? Math.max(1, Number(limitArg) || 0) : 0;

  const mode: Mode = useAll ? "all" : "keys";

  if (mode === "keys") {
    if (!keys.length) {
      throw new Error(
        "Provide --keys=a,b,c (or env SEED_KEYS) OR use --all [--brand=...] [--class=...]"
      );
    }
    const out: Array<{ key: string; data: any }> = [];
    for (const k of keys) {
      const snap = await adminDb.collection("cars").doc(k).get();
      if (!snap.exists) continue;
      out.push({ key: k, data: snap.data() });
    }
    return out;
  }

  // mode === "all"
  let q: FirebaseFirestore.Query = adminDb.collection("cars");
  if (brandFilter) q = q.where("brand", "==", brandFilter);
  if (classFilter) q = q.where("class", "==", classFilter);

  if (limit > 0) q = q.limit(limit);

  const snap = await q.get();
  return snap.docs.map((d) => ({ key: d.id, data: d.data() }));
}

(async function main(): Promise<void> {
  const quiet = process.env.SEED_QUIET === "1";
  const apply = hasFlag("apply"); // default is dry-run
  const requireV2 = !hasFlag("force"); // default: only prune when V2 exists

  const targets = await getTargets();

  if (!quiet) {
    console.log(`🧾 Targets found: ${targets.length}`);
    console.log(`🧪 Mode: ${hasFlag("all") ? "ALL" : "KEYS"} | Apply: ${apply ? "YES" : "NO (dry-run)"}`);
    if (!requireV2) console.log("⚠️ FORCE mode enabled: will prune even if V2 not detected.");
  }

  // Batch commits: max 500 ops; we’ll commit at 450 for buffer
  let batch = adminDb.batch();
  let batchOps = 0;

  let scanned = 0;
  let v2Eligible = 0;
  let wouldUpdate = 0;
  let updated = 0;

  for (const { key, data } of targets) {
    scanned++;

    if (!data) {
      if (!quiet) console.log(`⚠️ Not found: ${key}`);
      continue;
    }

    const hasV2 =
      isNonEmptyObject((data as any).maxStar) ||
      isNonEmptyObject((data as any).stages) ||
      isNonEmptyObject((data as any).stock) ||
      isNonEmptyObject((data as any).gold);

    if (requireV2 && !hasV2) {
      if (!quiet) console.log(`⏭️ Skipping ${key} (no V2 fields found)`);
      continue;
    }

    v2Eligible++;

    const updates: Record<string, FirebaseFirestore.FieldValue> = {};
    for (const field of LEGACY_STATS_KEYS) {
      if ((data as any)[field] !== undefined) {
        updates[field] = FieldValue.delete();
      }
    }

    const n = Object.keys(updates).length;
    if (n === 0) {
      if (!quiet) console.log(`✅ ${key}: no legacy fields to delete`);
      continue;
    }

    wouldUpdate++;
    if (!quiet) console.log(`${apply ? "🧹" : "📝"} ${key}: ${apply ? "deleting" : "would delete"} ${n} legacy field(s)`);

    if (apply) {
      const ref = adminDb.collection("cars").doc(key);
      batch.update(ref, updates);
      batchOps++;
      updated++;

      if (batchOps >= 450) {
        await batch.commit();
        batch = adminDb.batch();
        batchOps = 0;
      }
    }
  }

  if (apply && batchOps > 0) {
    await batch.commit();
  }

  console.log("✅ Prune legacy stats complete.");
  console.log(`🔎 Scanned: ${scanned}`);
  console.log(`🧬 Eligible (V2 detected${requireV2 ? "" : " or forced"}): ${v2Eligible}`);
  console.log(`${apply ? "✂️ Updated" : "📝 Would update"}: ${apply ? updated : wouldUpdate}`);

  if (!apply) {
    console.log("ℹ️ Dry-run only. Re-run with --apply to actually delete fields.");
  }

  process.exit(0);
})().catch((err) => {
  console.error("❌ Prune failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});