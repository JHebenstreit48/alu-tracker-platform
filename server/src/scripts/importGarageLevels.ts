import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import GarageLevelModel from "@/models/garageLevels";
import { connectToDb } from "@/Utility/connection";

// Path to your single JSON file
const jsonFilePath = path.resolve(__dirname, "../seeds/GarageLevels/GarageLevels.json");

// Function to build dynamic image path
function buildImagePath(brand: string, filename: string): string {
  const brandInitial = brand.charAt(0).toUpperCase();
  return `/images/cars/${brandInitial}/${brand}/${filename}`;
}

const importGarageLevels = async () => {
  console.log("🌱 Seeding garage levels...");

  try {
    await connectToDb();

    if (process.env.NODE_ENV !== "production") {
      await GarageLevelModel.deleteMany();
      console.log("🧼 Existing garage levels removed.");
    } else {
      console.log("🛑 Skipping deleteMany() in production.");
    }

    const rawData = fs.readFileSync(jsonFilePath, "utf-8");
    const parsedData = JSON.parse(rawData);

    if (!Array.isArray(parsedData)) {
      throw new Error("Garage levels JSON must be an array.");
    }

    // Enhance each car's image path
    const enhancedData = parsedData.map(level => ({
      GarageLevelKey: level.GarageLevelKey,
      xp: level.xp,
      cars: level.cars.map((car: any) => ({
        brand: car.brand,
        model: car.model,
        image: buildImagePath(car.brand, car.image)
      }))
    }));

    await GarageLevelModel.insertMany(enhancedData);
    console.log(`✅ Successfully imported ${enhancedData.length} garage levels.`);
  } catch (error) {
    console.error("❌ Error during import:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

importGarageLevels();
