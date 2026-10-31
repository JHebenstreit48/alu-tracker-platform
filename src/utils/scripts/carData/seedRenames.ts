import { adminDb } from '@/firebase/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import type { BrandBucket } from '@/types/scripts/carData/seedBucketTypes';

export type DetectedRename = {
  fromKey: string;
  toKey: string;
  fromLabel: string;
  toLabel: string;
  fromDoc: FirebaseFirestore.DocumentData;
};

export type RenameReport = {
  renames: DetectedRename[];
  ambiguous: string[];
  unmatchedRemoved: string[];
};

const label = (brand: unknown, model: unknown) =>
  `${String(brand ?? '')} ${String(model ?? '')}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const fingerprint = (d: { brand?: unknown; class?: unknown; addedDate?: unknown }) =>
  [d.brand, d.class, d.addedDate].map((v) => String(v ?? '').trim().toLowerCase()).join('|');

export async function detectRenames(
  brandBuckets: Map<string, BrandBucket>,
  allSeedKeys: Set<string>
): Promise<RenameReport> {
  const snap = await adminDb.collection('cars').get();
  const existing = new Map(snap.docs.map((d) => [d.id, d.data()] as const));

  const removed = Array.from(existing.entries()).filter(([k]) => !allSeedKeys.has(k));
  const added = Array.from(brandBuckets.values())
    .flatMap((b) => b.docs)
    .filter((d) => !existing.has(d.normalizedKey));

  const report: RenameReport = { renames: [], ambiguous: [], unmatchedRemoved: [] };

  for (const [fromKey, fromDoc] of removed) {
    const fp = fingerprint(fromDoc);
    if (fp.split('|').some((p) => !p)) {
      report.unmatchedRemoved.push(fromKey);
      continue;
    }

    const candidates = added.filter((d) => fingerprint(d) === fp);
    const rivals = removed.filter(([, d]) => fingerprint(d) === fp);

    if (candidates.length === 1 && rivals.length === 1) {
      const to = candidates[0];
      report.renames.push({
        fromKey,
        toKey: to.normalizedKey,
        fromLabel: label(fromDoc.brand, fromDoc.model),
        toLabel: label(to.brand, to.model),
        fromDoc,
      });
    } else if (candidates.length) {
      report.ambiguous.push(`${fromKey} → [${candidates.map((c) => c.normalizedKey).join(', ')}]`);
    } else {
      report.unmatchedRemoved.push(fromKey);
    }
  }

  return report;
}

export function printRenameReport(r: RenameReport): void {
  for (const x of r.renames) console.log(`🔀 Rename: ${x.fromKey} → ${x.toKey} ("${x.fromLabel}" → "${x.toLabel}")`);
  for (const a of r.ambiguous) console.warn(`⚠️ Ambiguous, skipped: ${a}`);
  for (const k of r.unmatchedRemoved) console.warn(`⚠️ In Firestore but not in seeds, no rename match: ${k}`);
  if (!r.renames.length && !r.ambiguous.length && !r.unmatchedRemoved.length) console.log('🔀 No renames detected.');
}

export async function applyRenames(renames: DetectedRename[]): Promise<void> {
  const col = adminDb.collection('carRenames');

  for (const r of renames) {
    const batch = adminDb.batch();

    const chained = await col.where('toKey', '==', r.fromKey).get();
    for (const d of chained.docs) {
      batch.update(d.ref, { toKey: r.toKey, toLabel: r.toLabel, updatedAt: FieldValue.serverTimestamp() });
    }

    batch.delete(col.doc(r.toKey));

    batch.set(col.doc(r.fromKey), {
      fromKey: r.fromKey,
      toKey: r.toKey,
      fromLabel: r.fromLabel,
      toLabel: r.toLabel,
      fromDoc: r.fromDoc,
      status: 'pending',
      detectedAt: FieldValue.serverTimestamp(),
    });

    batch.delete(adminDb.collection('cars').doc(r.fromKey));
    batch.delete(adminDb.collection('car_data_status').doc(r.fromKey));

    await batch.commit();
    console.log(`✅ Recorded rename ${r.fromKey} → ${r.toKey}`);
  }
}