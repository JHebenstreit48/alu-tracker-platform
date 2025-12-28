import "dotenv/config";
import { adminBucket } from "@/Firebase/firebaseAdmin";
import { logConfig } from "@/scripts/DatabaseImports/Cars/seedConfig";
import {
  buildBrandDocs,
  applyBrandDocs,
} from "@/scripts/DatabaseImports/Brands/seedBrands";

(async function main(): Promise<void> {
  console.log("🌱 Seeding brands/manufacturers into Firebase");
  logConfig(adminBucket?.name);

  const build = await buildBrandDocs();

  console.log(`📚 Brands from seeds: ${build.docs.length}`);

  const { brandOps, pruned } = await applyBrandDocs(build);

  console.log(
    `📊 Firestore brands: +${brandOps} upserts, ${pruned} pruned`
  );
  console.log("✅ Firebase brands import complete.");

  process.exit(0);
})().catch((err) => {
  console.error("❌ Brands import failed:", err);
  process.exit(1);
});