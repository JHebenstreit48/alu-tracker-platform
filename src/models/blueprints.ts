import mongoose, { Schema, Document, Types } from "mongoose";

// Interface for the Car model
interface IBlueprints extends Document {
  _id: Types.ObjectId; // MongoDB auto-generated ObjectId
  Class: string;
  Brand: string;
  Model: string;
  GarageLevel?: number;
  StarRank: number;
  CarRarity: string;
  BlueprintPrices: number[];
}

// Define the schema
const blueprintSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true }, // Explicitly define ObjectId
  Class: { type: String, required: true },
  Brand: { type: String, required: true },
  Model: { type: String, required: true },
  GarageLevel: { type: Number, required: false },
  StarRank: { type: Number, required: true },
  CarRarity: { type: String, required: true },
  BlueprintPrices: [{ type: Number, required: true }]
});

// Create and export the model
const BlueprintPricesModel = mongoose.model<IBlueprints>("Blueprints", blueprintSchema);
export default BlueprintPricesModel;
