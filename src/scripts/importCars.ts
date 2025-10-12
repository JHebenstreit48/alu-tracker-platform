import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import CarModel from "@/models/car/schema";
import CarDataStatus from "@/models/car/Statuses/dataStatus"; // ⬅️ NEW (status upserts)
import { connectToDb } from "@/Utility/connection";

const normalizeString = (str: string): string => {
  return str
    .normalize("NFD")                         // Decompose accents
    .replace(/[\u0300-\u036f]/g, "")          // Strip diacritics
    .toLowerCase()
    .replace(/\./g, "")                       // Remove periods
    .replace(/-/g, "_")                       // Replace dashes with underscores
    .replace(/\s+/g, "_")                     // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, "");              // Remove any remaining special chars
};

// 🔑 Helper to generate normalized keys
const generateCarKey = (brand: string, model: string): string => {
  return normalizeString(`${brand}_${model}`);
};

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

// ✔ Only accept known status values (fallback to "unknown")
const cleanStatus = (raw: any): "complete" | "in progress" | "missing" | "unknown" => {
  if (raw == null) return "unknown";
  const s = String(raw).toLowerCase().replace(/_/g, " ").trim();
  return (["complete", "in progress", "missing", "unknown"] as const).includes(s as any)
    ? (s as any)
    : "unknown";
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

      let parsedData: any[];
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

      // ✅ Enrich each car with normalizedKey
      const statusOps: any[] = []; // bulk upserts for statuses
      const enrichedData = parsedData.map((car: any) => {
        const normalizedKey = generateCarKey(car.Brand, car.Model);

        // If status info exists in the JSON, queue an upsert into CarDataStatus
        if (car.status !== undefined || car.message !== undefined || car.sources !== undefined) {
          const safeSources =
            Array.isArray(car.sources) ? car.sources : car.sources ? [String(car.sources)] : [];

          statusOps.push({
            updateOne: {
              filter: { normalizedKey },
              update: {
                $set: {
                  Brand: car.Brand,
                  Model: car.Model,
                  normalizedKey,
                  status: cleanStatus(car.status),
                  message: car.message ?? "",
                  sources: safeSources,
                },
              },
              upsert: true,
            },
          });
        }

        return {
          ...car,
          normalizedKey,
        };
      });

      await CarModel.insertMany(enrichedData);
      console.log(`✅ Imported ${enrichedData.length} from ${filePath}`);
      totalCount += enrichedData.length;

      if (statusOps.length) {
        await CarDataStatus.bulkWrite(statusOps, { ordered: false });
        console.log(`🛈 Upserted ${statusOps.length} status record(s) for ${filePath}`);
      }
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