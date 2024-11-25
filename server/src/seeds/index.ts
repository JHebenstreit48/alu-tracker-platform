import mongoose from "mongoose";
import CarModel from "../models/car"; // Ensure this is the correct path to your Car model
import carData from "../../Resources/asphalt_legends_cars.json"; // Replace with the actual path to your JSON file

const seedDatabase = async () => {
  try {
    // Connect to your MongoDB
    await mongoose.connect("mongodb://localhost:27017/asphalt_legends_db");

    console.log("Connected to MongoDB!");

    // Clear existing data
    await CarModel.deleteMany({});
    console.log("Existing cars deleted!");

    // Insert car data
    await CarModel.insertMany(carData);
    console.log("Cars data seeded successfully!");

    // Close the connection
    mongoose.connection.close();
    console.log("Database connection closed!");
  } catch (error) {
    console.error("Error seeding the database:", error);
    process.exit(1);
  }
};

seedDatabase();
