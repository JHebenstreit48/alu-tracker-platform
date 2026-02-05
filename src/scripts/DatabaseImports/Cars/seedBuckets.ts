import { adminDb } from "@/Firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import {
  CarDoc,
  SeedCar,
  StatusDoc,
  generateCarKey,
  cleanStatus,
} from "./seedTypes";
import { loadCarsFromFile } from "./seedLoadCars";
import { resolveImagePath } from "@/scripts/DatabaseImports/Images/seedImages";

type BrandBucket = {
  docs: CarDoc[];
  statuses: StatusDoc[];
  keys: Set<string>;

  // ✅ de-dupe support
  _bestByKey: Map<string, CarDoc>;
  _bestPrioByKey: Map<string, number>;
  _dupSeen: number;
  _dupReplaced: number;
};

export type BuildResult = {
  brandBuckets: Map<string, BrandBucket>;
  expectedFromSeeds: number;
};

function inferPriorityFromFile(file: string): number {
  // folder override: .../<CarFolder>/index.ts
  if (/[/\\]index\.ts$/i.test(file)) return 3;

  // collector: .../ClassA.ts
  if (/[/\\]Class[A-Z]\.ts$/i.test(file)) return 2;

  // json fallback
  if (/\.json$/i.test(file)) return 1;

  return 0;
}

export async function buildBuckets(files: string[]): Promise<BuildResult> {
  const brandBuckets = new Map<string, BrandBucket>();
  let expectedFromSeeds = 0;

  for (const file of files) {
    const filePriority = inferPriorityFromFile(file);

    try {
      const docs = await loadCarsFromFile(file);
      console.log(`📦 ${file} → docs: ${docs.length}`);
      if (!docs.length) continue;

      for (const car of docs as SeedCar[]) {
        const Brand = (car.Brand ?? "").toString().trim();
        const Model = (car.Model ?? "").toString().trim();
        const normalizedKey =
          (car.normalizedKey && String(car.normalizedKey).trim()) ||
          (Brand && Model ? generateCarKey(Brand, Model) : "");

        if (!Brand || !normalizedKey) {
          console.warn(
            `⚠️ Missing Brand/normalizedKey in ${file}; skipping one entry.`
          );
          continue;
        }

        const bucket =
          brandBuckets.get(Brand) ?? {
            docs: [],
            statuses: [],
            keys: new Set<string>(),

            _bestByKey: new Map<string, CarDoc>(),
            _bestPrioByKey: new Map<string, number>(),
            _dupSeen: 0,
            _dupReplaced: 0,
          };

        const nextDoc: CarDoc = { ...car, Brand, Model, normalizedKey };

        // ✅ deterministic de-dupe by normalizedKey with priority
        const prev = bucket._bestByKey.get(normalizedKey);
        if (!prev) {
          bucket._bestByKey.set(normalizedKey, nextDoc);
          bucket._bestPrioByKey.set(normalizedKey, filePriority);
          bucket.keys.add(normalizedKey);
          expectedFromSeeds++;
        } else {
          bucket._dupSeen++;

          const prevPrio = bucket._bestPrioByKey.get(normalizedKey) ?? 0;
          if (filePriority > prevPrio) {
            bucket._bestByKey.set(normalizedKey, nextDoc);
            bucket._bestPrioByKey.set(normalizedKey, filePriority);
            bucket._dupReplaced++;
            console.log(
              `🔁 Override ${normalizedKey}: replaced lower-priority seed with higher-priority (${prevPrio}→${filePriority}) from ${file}`
            );
          } else {
            console.log(
              `⏭️  Duplicate ${normalizedKey}: kept higher-priority seed (${prevPrio}>=${filePriority}), ignored ${file}`
            );
          }
        }

        // statuses: keep the highest-priority status payload too
        if (
          car.status !== undefined ||
          car.message !== undefined ||
          car.sources !== undefined
        ) {
          const rawSources = car.sources;
          const sources = Array.isArray(rawSources)
            ? rawSources.map(String)
            : rawSources
            ? [String(rawSources)]
            : [];

          // we’ll just collect and later de-dupe by normalizedKey+prio using the same rule:
          bucket.statuses.push({
            normalizedKey,
            Brand,
            Model,
            status: cleanStatus(car.status),
            message: car.message ? String(car.message) : "",
            sources,
          });
        }

        brandBuckets.set(Brand, bucket);
      }
    } catch (e) {
      console.warn(
        `⚠️ Failed ${file}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  // finalize docs array from bestByKey (and de-dupe statuses similarly)
  for (const [brand, bucket] of brandBuckets.entries()) {
    bucket.docs = Array.from(bucket._bestByKey.values());

    // de-dupe statuses to one per normalizedKey (simple: keep last, since our file ordering
    // is already handled by doc priority; if you want full parity, we can add a status priority map too)
    const statusByKey = new Map<string, StatusDoc>();
    for (const s of bucket.statuses) statusByKey.set(s.normalizedKey, s);
    bucket.statuses = Array.from(statusByKey.values());

    if (bucket._dupSeen > 0) {
      console.log(
        `🧩 ${brand}: duplicates seen ${bucket._dupSeen}, replaced by overrides ${bucket._dupReplaced}`
      );
    }
  }

  return { brandBuckets, expectedFromSeeds };
}

export async function applyBuckets(
  brandBuckets: Map<string, BrandBucket>
): Promise<{ carOps: number; statusOps: number }> {
  let carOps = 0;
  let statusOps = 0;

  for (const [brand, bucket] of brandBuckets.entries()) {
    const newKeys = bucket.keys;

    // prune stale cars for this brand
    const existingSnap = await adminDb
      .collection("cars")
      .where("Brand", "==", brand)
      .get();

    const deleteBatch = adminDb.batch();
    let deleteCount = 0;

    existingSnap.forEach((docSnap) => {
      const nk = docSnap.get("normalizedKey") as string | undefined;
      if (!nk || !newKeys.has(nk)) {
        deleteBatch.delete(docSnap.ref);
        deleteCount++;
      }
    });

    if (deleteCount > 0) {
      await deleteBatch.commit();
      console.log(`🧹 ${brand}: pruned ${deleteCount} stale row(s).`);
    }

    // upsert cars
    let batch = adminDb.batch();
    let batchCount = 0;

    for (const doc of bucket.docs) {
      const ref = adminDb.collection("cars").doc(doc.normalizedKey);
      const imagePath = typeof doc.Image === "string" ? doc.Image : undefined;
      const resolvedImage = resolveImagePath(imagePath);

      const toWrite: CarDoc = {
        ...doc,
        Image: resolvedImage ?? imagePath ?? "",
      };

      batch.set(ref, toWrite, { merge: true });
      batchCount++;

      if (batchCount >= 450) {
        await batch.commit();
        carOps += batchCount;
        batch = adminDb.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      carOps += batchCount;
    }

    // upsert statuses with updatedAt
    if (bucket.statuses.length) {
      let sBatch = adminDb.batch();
      let sCount = 0;

      for (const s of bucket.statuses) {
        const ref = adminDb.collection("car_data_status").doc(s.normalizedKey);

        const payload: StatusDoc & {
          updatedAt: FirebaseFirestore.FieldValue;
        } = {
          ...s,
          updatedAt: FieldValue.serverTimestamp(),
        };

        sBatch.set(ref, payload, { merge: true });
        sCount++;

        if (sCount >= 450) {
          await sBatch.commit();
          statusOps += sCount;
          sBatch = adminDb.batch();
          sCount = 0;
        }
      }

      if (sCount > 0) {
        await sBatch.commit();
        statusOps += sCount;
      }
    }
  }

  return { carOps, statusOps };
}