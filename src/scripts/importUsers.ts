import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UserModel from "@/models/user";
import { connectToDb } from "@/Utility/connection";

const usersFilePath = path.resolve(__dirname, "../seeds/Users/users.json");

const importUsers = async () => {
  console.log("🌱 User seeding started...");

  try {
    await connectToDb();

    // Clear existing users
    await UserModel.deleteMany();
    console.log("🧼 Existing users removed.");

    const rawData = fs.readFileSync(usersFilePath, "utf-8");

    let users;
    try {
      users = JSON.parse(rawData);
    } catch (e) {
      console.error("❌ Failed to parse users.json");
      return;
    }

    if (!Array.isArray(users)) {
      console.error("❌ users.json is not an array");
      return;
    }

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    await UserModel.insertMany(usersWithHashedPasswords);
    console.log(`✅ Imported ${usersWithHashedPasswords.length} users.`);
  } catch (error) {
    console.error("❌ Error during user import:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

importUsers();
