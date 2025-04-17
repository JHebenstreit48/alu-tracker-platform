import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import CarModel from "@/models/car";
import { connectToDb } from "@/Utility/connection";

const brandsDir = path.resolve(__dirname, "../seeds/brands");
console.log("📁 Resolved brandsDir:", brandsDir);

const importCars = async () => {
  console.log("🌱 Seeding started...");

  try {
    await connectToDb();

    // Optional: prevent clearing DB in production
    if (process.env.NODE_ENV !== "production") {
      await CarModel.deleteMany();
      console.log("🧼 Existing cars removed.");
    } else {
      console.log("🛑 Skipping deleteMany() in production.");
    }

    const files = fs.readdirSync(brandsDir).filter(file => file.endsWith(".json"));
    console.log("📂 Files found in brandsDir:", files);

    let totalCount = 0;

    for (const file of files) {
      const filePath = path.join(brandsDir, file);
      console.log(`📥 Reading file: ${filePath}`);

      const rawData = fs.readFileSync(filePath, "utf-8");
      const brandCars = JSON.parse(rawData);

      if (!Array.isArray(brandCars)) {
        console.warn(`⚠️ Skipped ${file} — not a valid array.`);
        continue;
      }

      await CarModel.insertMany(brandCars);
      console.log(`✅ Imported ${brandCars.length} cars from ${file}`);
      totalCount += brandCars.length;
    }

    console.log(`🚗 Finished importing ${totalCount} total cars.`);
  } catch (error) {
    console.error("❌ Error during import:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

importCars();
