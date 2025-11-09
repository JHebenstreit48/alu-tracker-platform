import "dotenv/config";
import { adminDb } from "@/Firebase/firebaseAdmin";

async function main(): Promise<void> {
  await adminDb.collection("diagnostics").doc("hello").set({
    ok: true,
    when: new Date().toISOString(),
  });
  console.log("✅ wrote diagnostics/hello");
}

main().catch((err) => {
  console.error("❌ ping failed:", err);
  process.exit(1);
});