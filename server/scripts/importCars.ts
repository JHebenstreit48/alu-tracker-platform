import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import CarModel from "@/src/models/car";
import carData from "@/Resources/asphalt_legends_cars";

const importCars = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/carsdb"
    );
    console.log("Connected to MongoDB.");

    // Clear existing data
    await CarModel.deleteMany();

    // Insert new data
    await CarModel.insertMany(carData);

    console.log("Car data imported successfully.");
  } catch (error) {
    console.error("Error importing car data:", error);
  } finally {
    mongoose.connection.close();
  }
};

importCars();
