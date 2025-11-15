// import mongoose from "mongoose";
// import "dotenv/config";

// const COLLECTIONS = (process.env.CONTENT_COLLECTIONS || "manufacturers,garagelevels,legendstore")
//   .split(",")
//   .map(s => s.trim())
//   .filter(Boolean);

// async function confirmProdGuard(uri: string) {
//   const looksProd = /prod|production|atlas|mongodb\.net/i.test(uri);
//   if (looksProd && process.env.ALLOW_CONTENT_DROP !== "1") {
//     console.error("⚠️  Refusing to drop content collections on a prod-looking URI without ALLOW_CONTENT_DROP=1");
//     process.exit(2);
//   }
// }

// async function dropIfExists(db: any, name: string) {
//   const exists = await db.listCollections({ name }).hasNext();
//   if (!exists) {
//     console.log(`ℹ️  ${name} does not exist, skipping`);
//     return;
//   }
//   await db.collection(name).drop();
//   console.log(`✅ dropped ${name}`);
// }

// async function run() {
//   const uri = process.env.MONGODB_URI;
//   if (!uri) {
//     console.error("❌ MONGODB_URI not set");
//     process.exit(1);
//   }
//   await confirmProdGuard(uri);

//   await mongoose.connect(uri);
//   const conn: any = mongoose.connection;
//   const db = conn.db;

//   console.log(`🔌 Connected to DB: ${conn.name}`);
//   console.log(`🧹 Collections to drop: ${COLLECTIONS.join(", ")}`);

//   for (const name of COLLECTIONS) {
//     try {
//       await dropIfExists(db, name);
//     } catch (e: any) {
//       console.warn(`⚠️  Could not drop ${name}: ${e.message}`);
//     }
//   }

//   await mongoose.disconnect();
//   console.log("✨ Done");
// }

// run().catch(e => { console.error(e); process.exit(1); });