import mongoose, { Schema, Document, Types } from "mongoose";

// Small Interface for the embedded Car subdocument
export interface ICarForGarageLevel {
  brand: string;
  model: string;
  image: string;
}

// Main Interface for the Garage Level document
export interface IGarageLevel extends Document {
  _id: Types.ObjectId; // MongoDB auto-generated ObjectId
  garageLevelKey: number; // Example: 5
  xp: number; // Example: 40000
  cars: ICarForGarageLevel[]; // Array of cars unlocked at this level
}

// Define sub-schema for Car
const CarForGarageLevelSchema: Schema = new Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  image: { type: String, required: true },
});

// Define main schema for Garage Level
const GarageLevelSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  garageLevelKey: { type: Number, required: true },
  xp: { type: Number, required: true },
  cars: { type: [CarForGarageLevelSchema], required: true },
});

// Create and export the model
const GarageLevelModel = mongoose.model<IGarageLevel>("GarageLevel", GarageLevelSchema);

export default GarageLevelModel;
