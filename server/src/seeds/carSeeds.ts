import mongoose from "mongoose";
import CarModel from "../models/car"; // Adjust to your actual CarModel file location
import { carData } from "./carData";
import { connectDB, disconnectDB } from "./index"; // Adjust to the correct path

(async function seedDatabase() {
  try {
    await connectDB(); // Connect to MongoDB
    console.log("Connected to MongoDB.");

    console.log("Seeding database...");
    for (const car of carData) {
      await CarModel.updateOne({ _id: car._id }, car, { upsert: true });
    }
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await disconnectDB(); // Disconnect after seeding
  }
})();
