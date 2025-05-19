import mongoose, { Schema, Document, Types } from "mongoose";

// Interface for the Car model
interface ICar extends Document {
  _id: Types.ObjectId; // MongoDB auto-generated ObjectId
  Image: string;
  ImageStatus?: "available" | "coming-soong" | "unavailable";
  Class: string;
  Brand: string;
  Model: string;
  Rarity: string;
  Stars: number;
  KeyCar?: boolean;
  Max_Rank: number;
  Epics: number;
  Obtainable_Via: string;
  Garage_Level: number;
  Stock_Rank?: number;
  Stock_Top_Speed?: number;
  Stock_Acceleration?: number;
  Stock_Handling?: number;
  Stock_Nitro?: number;
  One_Star_Top_Speed?: number;
  One_Star_Acceleration?: number;
  One_Star_Handling?: number;
  One_Star_Nitro?: number;
  Two_Star_Stock_Rank?: number;
  Two_Star_Top_Speed?: number;
  Two_Star_Acceleration?: number;
  Two_Star_Handling?: number;
  Two_Star_Nitro?: number;
  Gold_Top_Speed: number;
  Gold_Acceleration: number;
  Gold_Handling: number;
  Gold_Nitro: number;
  Added: string;
  Added_With: string | null;
  Added_Date: string;
  Total_Upgrade_Cost: number | null;
  Country: string;
  Tags: string;
  BPs_1_Star: number;
  BPs_2_Star: number;
  BPs_3_Star: number;
  BPs_4_Star: number | null;
  BPs_5_Star: number | null;
  BPs_6_Star: number | null;
  Total_BPs: number | null;
}

// Define the schema
const carSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true }, // Explicitly define ObjectId
  Image: { type: String, required: false },
  ImageStatus: {
    type: String,
    enum: ["available", "coming-soong", "unavailable"],
    default: "available",
  },
  Class: { type: String, required: true },
  Brand: { type: String, required: true },
  Model: { type: String, required: true },
  Rarity: { type: String },
  Stars: { type: Number },
  KeyCar: { type: Boolean, default: false },
  Max_Rank: { type: Number },
  Epics: { type: Number },
  Obtainable_Via: { type: String },
  Garage_Level: { type: Number },
  Stock_Rank: { type: Number },
  Stock_Top_Speed: { type: Number },
  Stock_Acceleration: { type: Number },
  Stock_Handling: { type: Number },
  Stock_Nitro: { type: Number },
  One_Star_Stock_Rank: { type: Number },
  One_Star_Top_Speed: { type: Number },
  One_Star_Acceleration: { type: Number },
  One_Star_Handling: { type: Number },
  One_Star_Nitro: { type: Number },
  Two_Star_Stock_Rank: { type: Number },
  Two_Star_Top_Speed: { type: Number },
  Two_Star_Acceleration: { type: Number },
  Two_Star_Handling: { type: Number },
  Two_Star_Nitro: { type: Number },
  Gold_Top_Speed: { type: Number },
  Gold_Acceleration: { type: Number },
  Gold_Handling: { type: Number },
  Gold_Nitro: { type: Number },
  Added: { type: String },
  Added_With: { type: String, default: null },
  Added_Date: { type: String },
  Total_Upgrade_Cost: { type: Number, default: null },
  Country: { type: String },
  Tags: { type: String },
  BPs_1_Star: { type: Number },
  BPs_2_Star: { type: Number },
  BPs_3_Star: { type: Number },
  BPs_4_Star: { type: Number, default: null },
  BPs_5_Star: { type: Number, default: null },
  BPs_6_Star: { type: Number, default: null },
  Total_Bps: { type: Number },
  Cost_Epic: { type: Number, default: null },
});

// Create and export the model
const CarModel = mongoose.model<ICar>("Car", carSchema);
export default CarModel;