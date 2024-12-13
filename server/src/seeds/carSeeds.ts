import mongoose from "mongoose";
import CarModel from "../models/car";
import { carData } from "./carData";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    throw new Error("MONGODB_URI is not defined in the environment variables. Please check your .env file.");
}

async function seedDatabase() {
    try {
        console.log("Connecting to MongoDB URI:", MONGO_URI);
        await mongoose.connect(MONGO_URI as string); // Assert that MONGO_URI is a string
        console.log("Connected to MongoDB");

        for (const car of carData) {
            const query = { _id: car._id.$oid };
            const update = { ...car, _id: new mongoose.Types.ObjectId(car._id.$oid) };
            const options = { upsert: true, new: true };

            const result = await CarModel.findOneAndUpdate(query, update, options);
            console.log(`Upserted car: ${car.Model}, result:`, result);
        }

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

seedDatabase();
