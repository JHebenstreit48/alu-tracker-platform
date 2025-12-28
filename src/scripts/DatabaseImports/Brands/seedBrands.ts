import fs from "fs";
import path from "path";
import { adminDb } from "@/Firebase/firebaseAdmin";
import { getBrandSeedFiles } from "./seedFs";
import { SeedBrand, BrandDoc, toArray, makeSlug } from "./seedTypes";

export type BrandBuildResult = {
  docs: BrandDoc[];
  slugs: Set<string>;
};

function deriveBrandName(seed: SeedBrand, file: string): string | null {
  const fromFields =
    seed.brand ||
    (seed as any).Brand ||
    (seed as any).name ||
    (seed as any).Name;

  const raw = (fromFields || "").toString().trim();
  if (raw) return raw;

  const base = path.basename(file, ".json").trim();
  return base || null;
}

function toStringArrayRequired(value: unknown, label: string): string[] {
  if (Array.isArray(value)) {
    const arr = value
      .map((v) => v?.toString().trim())
      .filter((v): v is string => Boolean(v));
    if (arr.length) return arr;
  } else if (typeof value === "string") {
    const s = value.trim();
    if (s) return [s];
  }
  throw new Error(`Missing or invalid ${label}`);
}

function toResourcesOptional(
  value: SeedBrand["resources"]
): { text: string; url: string }[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value
    .map((r) =>
      r && r.text && r.url
        ? { text: String(r.text), url: String(r.url) }
        : null
    )
    .filter((r): r is { text: string; url: string } => r !== null);
  return out.length ? out : undefined;
}

function toLocationRequired(seed: SeedBrand): { lat: number; lng: number } {
  const loc = seed.location || {};
  const lat = typeof loc.lat === "number" ? loc.lat : NaN;
  const lng = typeof loc.lng === "number" ? loc.lng : NaN;
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error("Missing or invalid location.lat/lng");
  }
  return { lat, lng };
}

export async function buildBrandDocs(): Promise<BrandBuildResult> {
  const files = getBrandSeedFiles();
  const docs: BrandDoc[] = [];
  const slugs = new Set<string>();

  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, "utf8");
      const parsed = JSON.parse(raw);
      const items = toArray(parsed);

      if (!items.length) {
        console.warn(`⚠️ No data in ${file}; skipping`);
        continue;
      }

      for (const seed of items) {
        try {
          const brand = deriveBrandName(seed, file);
          if (!brand) throw new Error("brand not found");

          const slug = makeSlug(seed.slug, brand);
          if (!slug) throw new Error("slug could not be derived");

          if (!seed.description) {
            throw new Error("missing description");
          }
          if (!seed.logo) {
            throw new Error("missing logo");
          }

          const country = toStringArrayRequired(seed.country, "country");
          const establishedRaw = seed.established;
          const established =
            typeof establishedRaw === "number"
              ? establishedRaw
              : establishedRaw
              ? Number(establishedRaw)
              : NaN;
          if (!Number.isFinite(established)) {
            throw new Error("missing or invalid established");
          }

          const location = toLocationRequired(seed);
          const resources = toResourcesOptional(seed.resources);

          const headquarters = seed.headquarters
            ? String(seed.headquarters).trim()
            : "";
          const primaryMarket = seed.primaryMarket
            ? String(seed.primaryMarket).trim()
            : "";

          const doc: BrandDoc = {
            slug,
            brand,
            description: String(seed.description),
            logo: String(seed.logo),
            country,
            established,
            location,
            ...(headquarters ? { headquarters } : {}),
            ...(primaryMarket ? { primaryMarket } : {}),
            ...(resources ? { resources } : {}),
          };

          docs.push(doc);
          slugs.add(slug);
        } catch (innerErr) {
          console.warn(
            `⚠️ Skipping entry in ${file}: ${
              innerErr instanceof Error ? innerErr.message : String(innerErr)
            }`
          );
        }
      }
    } catch (e) {
      console.warn(
        `⚠️ Failed ${file}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }

  return { docs, slugs };
}

export async function applyBrandDocs(
  build: BrandBuildResult
): Promise<{ brandOps: number; pruned: number }> {
  const { docs, slugs } = build;

  // prune stale brands
  const existingSnap = await adminDb.collection("brands").get();
  const pruneBatch = adminDb.batch();
  let pruned = 0;

  existingSnap.forEach((docSnap) => {
    const slug = docSnap.id;
    if (!slugs.has(slug)) {
      pruneBatch.delete(docSnap.ref);
      pruned++;
    }
  });

  if (pruned > 0) {
    await pruneBatch.commit();
    console.log(`🧹 Pruned ${pruned} stale brand(s).`);
  }

  // upsert brands
  let brandOps = 0;
  let batch = adminDb.batch();
  let count = 0;

  for (const doc of docs) {
    const ref = adminDb.collection("brands").doc(doc.slug);
    batch.set(ref, doc, { merge: true });
    count++;

    if (count >= 450) {
      await batch.commit();
      brandOps += count;
      batch = adminDb.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    brandOps += count;
  }

  return { brandOps, pruned };
}