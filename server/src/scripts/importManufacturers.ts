import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import ManufacturerModel from "@/models/manufacturers"; // Import your Manufacturer model
import { connectToDb } from "@/Utility/connection";     // Your shared db connection utility

const manufacturersDir = path.resolve(__dirname, "../seeds/Manufacturers");

// Recursive function to collect all JSON files in subfolders (A-Z/Brand/)
const collectJsonFiles = (dirPath: string): string[] => {
  let jsonFiles: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      jsonFiles = jsonFiles.concat(collectJsonFiles(fullPath)); // Dive deeper into subfolders
    } else if (entry.isFile() && fullPath.endsWith(".json")) {
      jsonFiles.push(fullPath);
    }
  }

  return jsonFiles;
};

const importManufacturers = async () => {
  console.log("🌱 Starting Manufacturers seeding...");

  try {
    await connectToDb();

    if (process.env.NODE_ENV !== "production") {
      await ManufacturerModel.deleteMany();
      console.log("🧼 Existing Manufacturers removed.");
    }

    const allJsonFiles = collectJsonFiles(manufacturersDir);
    console.log(`📄 Found ${allJsonFiles.length} Manufacturer JSON files.`);

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

      if (Array.isArray(parsedData)) {
        console.warn(`⚠️ Expected single object, got array: skipping ${filePath}`);
        continue;
      }

      try {
        await ManufacturerModel.create(parsedData);
        console.log(`✅ Imported manufacturer from ${filePath}`);
        totalCount += 1;
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

    console.log(`📦 Successfully imported ${totalCount} manufacturers.`);
  } catch (error) {
    console.error("❌ Import failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
};

importManufacturers();
