import mongoose, { Schema, Document, Types } from "mongoose";

// Interface for the Car model
interface ICar extends Document {
  _id: Types.ObjectId; // MongoDB auto-generated ObjectId
  Class: string;
  Order: number;
  Brand: string;
  Model: string;
  Rarity: string;
  Stars: number;
  Max_Rank: number;
  Epics: number;
  Obtainable_Via: string;
  Garage_Level: number;
  Top_Speed: string;
  Acceleration: string;
  Handling: string;
  Nitro: string;
  Nitro_TS: string;
  Perfect_Nitro_TS: string | null;
  Added: string;
  Added_With: string | null;
  Added_Date: string;
  Total_Upgrade_Cost: number | null;
  Total_GL_Points: number | null;
  Country: string;
  Tags: string;
  Bps_1_Star: string;
  Bps_2_Star: number;
  Bps_3_Star: number;
  Bps_4_Star: number | null;
  Bps_5_Star: number | null;
  Bps_6_Star: number | null;
  Total_Bps: number;
  Cost_Epic: number | null;
}

// Define the schema
const carSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true }, // Explicitly define ObjectId
  Class: { type: String, required: true },
  Order: { type: Number, required: true },
  Brand: { type: String, required: true },
  Model: { type: String, required: true },
  Rarity: { type: String },
  Stars: { type: Number },
  Max_Rank: { type: Number },
  Epics: { type: Number },
  Obtainable_Via: { type: String },
  Garage_Level: { type: Number },
  Top_Speed: { type: String },
  Acceleration: { type: String },
  Handling: { type: String },
  Nitro: { type: String },
  Nitro_TS: { type: String },
  Perfect_Nitro_TS: { type: String, default: null },
  Added: { type: String },
  Added_With: { type: String, default: null },
  Added_Date: { type: String },
  Total_Upgrade_Cost: { type: Number, default: null },
  Total_GL_Points: { type: Number, default: null },
  Country: { type: String },
  Tags: { type: String },
  Bps_1_Star: { type: String },
  Bps_2_Star: { type: Number },
  Bps_3_Star: { type: Number },
  Bps_4_Star: { type: Number, default: null },
  Bps_5_Star: { type: Number, default: null },
  Bps_6_Star: { type: Number, default: null },
  Total_Bps: { type: Number },
  Cost_Epic: { type: Number, default: null },
});

// Create and export the model
const CarModel = mongoose.model<ICar>("Car", carSchema);
export default CarModel;
