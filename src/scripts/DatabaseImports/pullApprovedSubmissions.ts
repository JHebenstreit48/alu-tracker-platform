import 'dotenv/config';
import path from 'path';
import { adminDb } from '@/Firebase/firebaseAdmin';
import type { CarPatch, Submission } from '@/types/scripts/approvedSubmissions';
import { findCarFolder, mergePatch, applyPatch } from '@/utils/scripts/approvedSubmissions';

const DRY = process.argv.includes('--dry');
const CARS_ROOT = path.resolve(__dirname, '../../seeds/cars');
const COLL = 'carSubmissions';

async function main() {
  console.log('\n──────────────────────────────────────────────────');
  console.log(`  Pull Approved Submissions ${DRY ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('──────────────────────────────────────────────────\n');

  const snap = await adminDb.collection(COLL).where('status', '==', 'approved').get();

  if (snap.empty) {
    console.log('  No approved submissions found.');
    console.log('\n──────────────────────────────────────────────────\n');
    return;
  }

  console.log(`  Found ${snap.docs.length} approved submission(s)\n`);

  const mergedPatches: Record<string, CarPatch> = {};
  const submissionMeta: { id: string; username: string; note?: string }[] = [];

  for (const doc of snap.docs) {
    const submission = { id: doc.id, ...doc.data() } as Submission;
    submissionMeta.push({
      id: submission.id,
      username: submission.submitterUsername,
      note: submission.submitterNote,
    });

    console.log(`● Submission: ${submission.id}`);
    console.log(`  By: ${submission.submitterUsername}`);
    console.log(`  Cars: ${Object.keys(submission.cars).join(', ')}`);
    if (submission.submitterNote) console.log(`  Note: ${submission.submitterNote}`);

    for (const [normalizedKey, patch] of Object.entries(submission.cars)) {
      if (!mergedPatches[normalizedKey]) mergedPatches[normalizedKey] = {};
      mergedPatches[normalizedKey] = mergePatch(mergedPatches[normalizedKey], patch);
    }
  }

  console.log(`\n  Merged into ${Object.keys(mergedPatches).length} unique car(s) to update\n`);

  let applied = 0;
  let notFound = 0;

  for (const [normalizedKey, patch] of Object.entries(mergedPatches)) {
    const carFolder = findCarFolder(normalizedKey, CARS_ROOT);
    if (!carFolder) {
      console.warn(`  ⚠ Car not found for normalizedKey: ${normalizedKey}`);
      notFound++;
      continue;
    }
    applyPatch(carFolder, normalizedKey, patch, DRY);
    applied++;
  }

  for (const meta of submissionMeta) {
    if (!DRY) {
      await adminDb.collection(COLL).doc(meta.id).update({
        status: 'imported',
        importedAt: new Date().toISOString(),
      });
      console.log(`\n  ✓ Marked as imported: ${meta.id}`);
    } else {
      console.log(`\n  [DRY] Would mark as imported: ${meta.id}`);
    }
  }

  console.log('\n──────────────────────────────────────────────────');
  console.log(`  Cars applied  : ${applied}`);
  console.log(`  Cars not found: ${notFound}`);
  if (DRY) console.log('\n  Run without --dry to apply changes.');
  console.log('──────────────────────────────────────────────────\n');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});