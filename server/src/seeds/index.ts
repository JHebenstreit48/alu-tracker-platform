import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/carsDB"; // Replace with your actual MongoDB URI

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process on connection error
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected successfully.");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};
