import mongoose, { Schema } from "mongoose";
import { baseCarInfo } from "@/models/car/baseCarInfo";
import { blueprints } from "@/models/car/blueprints";
import { stockStats } from "@/models/car/stockStats";
import { oneStarStockStats } from "@/models/car/oneStarMaxStats";
import { twoStarStockStats } from "@/models/car/twoStarMaxStats";
import { goldMaxStats } from "@/models/car/goldMaxStats";

const carSchemaFields = {
  _id: { type: Schema.Types.ObjectId, auto: true },
  ...baseCarInfo,
  ...blueprints,
  ...stockStats,
  ...oneStarStockStats,
  ...twoStarStockStats,
  ...goldMaxStats
};

const carSchema = new Schema(carSchemaFields);
const CarModel = mongoose.model("Car", carSchema);
export default CarModel;
