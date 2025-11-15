// import dotenv from "dotenv";
// dotenv.config();

// import mongoose from "mongoose";
// import CarModel from "@/models/car/schema";
// import { connectToDb } from "@/Utility/connection";

// (async () => {
//   await connectToDb();

//   const total = await CarModel.countDocuments();
//   console.log("DB total cars:", total);

//   // helpful: counts by Brand
//   const byBrand = await CarModel.aggregate([
//     { $group: { _id: "$Brand", n: { $sum: 1 } } },
//     { $sort: { n: -1, _id: 1 } }
//   ]);
//   console.log("\nTop brands by count:");
//   byBrand.slice(0, 15).forEach(b => console.log(`${b._id ?? "(no brand)"}: ${b.n}`));

//   // helpful: find possible duplicates by Brand+Model
//   const dups = await CarModel.aggregate([
//     { $group: { _id: { Brand: "$Brand", Model: "$Model" }, ids: { $push: "$_id" }, n: { $sum: 1 } } },
//     { $match: { n: { $gt: 1 } } },
//     { $sort: { n: -1 } }
//   ]);
//   if (dups.length) {
//     console.log("\nPotential duplicates (same Brand+Model):");
//     dups.forEach(d => console.log(`${d._id.Brand} ${d._id.Model} -> ${d.n}`));
//   } else {
//     console.log("\nNo Brand+Model duplicates detected.");
//   }

//   await mongoose.disconnect();
// })();