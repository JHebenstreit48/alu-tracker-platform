import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import CarModel from "@/models/car/schema";
import { connectToDb } from "@/Utility/connection";

const brandsDir = path.resolve(__dirname, "../seeds/Brands");

const collectJsonFiles = (dirPath: string): string[] => {
  let jsonFiles: string[] = [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      jsonFiles = jsonFiles.concat(collectJsonFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith(".json")) {
      jsonFiles.push(fullPath);
    }
  }

  return jsonFiles;
};

const importCars = async () => {
  console.log("🌱 Car seeding started...");

  try {
    await connectToDb();

    // ✅ Always clear the collection
    await CarModel.deleteMany();
    console.log("🧼 Existing cars removed.");

    const allJsonFiles = collectJsonFiles(brandsDir);
    console.log(`📄 Found ${allJsonFiles.length} JSON files.`);

    let totalCount = 0;

    for (const filePath of allJsonFiles) {
      const rawData = fs.readFileSync(filePath, "utf-8");

      let parsedData;
      try {
        parsedData = JSON.parse(rawData);
      } catch (e) {
        console.warn(`⚠️ Skipped invalid JSON: ${filePath}`);
        continue;
      }

      if (!Array.isArray(parsedData)) {
        console.warn(`⚠️ Skipped (not an array): ${filePath}`);
        continue;
      }

      await CarModel.insertMany(parsedData);
      console.log(`✅ Imported ${parsedData.length} from ${filePath}`);
      totalCount += parsedData.length;
    }

    const finalCount = await CarModel.countDocuments();
    console.log(`🚗 Finished importing ${totalCount} cars.`);
    console.log(`📊 Current total in database: ${finalCount}`);
  } catch (error) {
    console.error("❌ Error during import:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

importCars();
