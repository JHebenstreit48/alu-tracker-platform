import { connectDB, disconnectDB } from "./index"; // Import database connection logic
import CarModel from "../models/car"; // Ensure this points to your CarModel schema file
import carsData from "./carData"; // Import car data

const seedCars = async () => {
  try {
    await connectDB(); // Connect to MongoDB

    // Clear existing data
    await CarModel.deleteMany({});
    console.log("Existing car data cleared.");

    // Insert the new data
    if (carsData.length > 0) {
      await CarModel.insertMany(carsData);
      console.log("Car data seeded successfully.");
    } else {
      console.log("No car data provided to seed.");
    }
  } catch (error) {
    console.error("Error seeding car data:", error);
  } finally {
    await disconnectDB(); // Disconnect from MongoDB
  }
};

// Run the seeding function
seedCars();
