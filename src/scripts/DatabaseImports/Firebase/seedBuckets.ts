import { adminDb } from "@/Firebase/firebaseAdmin";
import {
  CarDoc,
  SeedCar,
  StatusDoc,
  generateCarKey,
  cleanStatus,
} from "./seedTypes";
import { loadCarsFromFile } from "./seedLoadCars";
import { resolveImagePath } from "./seedImages";

type BrandBucket = {
  docs: CarDoc[];
  statuses: StatusDoc[];
  keys: Set<string>;
};

export type BuildResult = {
  brandBuckets: Map<string, BrandBucket>;
  expectedFromSeeds: number;
};

export async function buildBuckets(files: string[]): Promise<BuildResult> {
  const brandBuckets = new Map<string, BrandBucket>();
  let expectedFromSeeds = 0;

  for (const file of files) {
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
          brandBuckets.get(Brand) || {
            docs: [],
            statuses: [],
            keys: new Set<string>(),
          };

        if (bucket.keys.has(normalizedKey)) {
          console.warn(
            `⚠️ Duplicate normalizedKey for ${Brand} ${Model}: ${normalizedKey}`
          );
        }

        const doc: CarDoc = { ...car, Brand, Model, normalizedKey };
        bucket.docs.push(doc);
        bucket.keys.add(normalizedKey);

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
        expectedFromSeeds++;
      }
    } catch (e) {
      console.warn(
        `⚠️ Failed ${file}: ${e instanceof Error ? e.message : String(e)}`
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

    // prune stale docs for this brand
    const existingSnap = await adminDb
      .collection("cars")
      .where("Brand", "==", brand)
      .get();

    const deleteBatch = adminDb.batch();
    let deleteCount = 0;

    existingSnap.forEach((doc) => {
      const nk = doc.get("normalizedKey") as string | undefined;
      if (!nk || !newKeys.has(nk)) {
        deleteBatch.delete(doc.ref);
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
      const imagePath =
        typeof doc.Image === "string" ? (doc.Image as string) : undefined;
      const resolvedImage = await resolveImagePath(imagePath);

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

    // upsert statuses
    if (bucket.statuses.length) {
      let sBatch = adminDb.batch();
      let sCount = 0;

      for (const s of bucket.statuses) {
        const ref = adminDb.collection("car_data_status").doc(s.normalizedKey);
        sBatch.set(ref, s, { merge: true });
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