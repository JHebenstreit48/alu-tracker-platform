import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/carsdb");
        console.log("Connected to MongoDB.");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export { connectToDb };