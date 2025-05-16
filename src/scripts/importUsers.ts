import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import User from "@/models/user";
import { connectToDb } from "@/Utility/connection";
import bcrypt from "bcrypt";

const usersFile = path.resolve(__dirname, "../seeds/users.json");

const importUsers = async () => {
  console.log("🌱 User seeding (fresh import) started...");

  try {
    await connectToDb();

    if (!fs.existsSync(usersFile)) {
      console.warn("⚠️ No users.json file found.");
      return;
    }

    const rawData = fs.readFileSync(usersFile, "utf-8");
    const users = JSON.parse(rawData);

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await User.create({
        username: user.username,
        email: user.email,
        password: hashedPassword,
      });

      console.log(`✅ Added user: ${user.email}`);
    }

    console.log(`🚀 Finished seeding ${users.length} users.`);
  } catch (error) {
    console.error("❌ Error during user import:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

importUsers();
