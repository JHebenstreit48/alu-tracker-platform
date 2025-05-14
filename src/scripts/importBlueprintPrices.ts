import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import BlueprintPricesModel from "@/models/blueprints";
import { connectToDb } from "@/Utility/connection";

const blueprintDir = path.resolve(__dirname, "../seeds/LegendStore/BlueprintData");

const collectJsonFiles = (dirPath: string): string[] => {
  let jsonFiles: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile() && fullPath.endsWith(".json")) {
      jsonFiles.push(fullPath);
    }
  }

  return jsonFiles;
};

const importBlueprints = async () => {
  console.log("🌱 Starting BlueprintPrices seeding...");

  try {
    await connectToDb();

    if (process.env.NODE_ENV !== "production") {
      await BlueprintPricesModel.deleteMany();
      console.log("🧼 Existing BlueprintPrices removed.");
    }

    const allJsonFiles = collectJsonFiles(blueprintDir);
    console.log(`📄 Found ${allJsonFiles.length} Blueprint JSON files.`);

    let totalCount = 0;

    for (const filePath of allJsonFiles) {
      const rawData = fs.readFileSync(filePath, "utf-8");
      let parsedData;

      try {
        parsedData = JSON.parse(rawData);
      } catch (e) {
        console.warn(`⚠️ Invalid JSON skipped: ${filePath}`);
        continue;
      }

      if (!Array.isArray(parsedData)) {
        console.warn(`⚠️ Expected array, skipping: ${filePath}`);
        continue;
      }

      try {
        await BlueprintPricesModel.insertMany(parsedData);
        console.log(`✅ Imported ${parsedData.length} from ${filePath}`);
        totalCount += parsedData.length;
      } catch (insertError) {
        console.error(`❌ Failed to insert from ${filePath}`);

        if (insertError instanceof mongoose.Error.ValidationError) {
          console.error(`🔍 Validation errors in file: ${filePath}`);
          for (const [key, errorObj] of Object.entries(insertError.errors)) {
            const message = (errorObj as mongoose.Error.ValidatorError).message;
            console.error(`- ${key}: ${message}`);
          }
        } else {
          console.error(insertError);
        }
      }
    }

    console.log(`📦 Successfully imported ${totalCount} blueprint entries.`);
  } catch (error) {
    console.error("❌ Import failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
};

importBlueprints();
