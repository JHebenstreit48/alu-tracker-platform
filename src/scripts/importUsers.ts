import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "@/models/user";
import { connectToDb } from "@/Utility/connection";

const clearUsers = async () => {
  console.log("🧹 Wiping all users from the database...");

  try {
    await connectToDb();

    const result = await User.deleteMany({});
    console.log(`✅ All users deleted. Count: ${result.deletedCount}`);
  } catch (error) {
    console.error("❌ Error during user wipe:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

clearUsers();
