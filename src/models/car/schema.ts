import mongoose, { Schema } from "mongoose";
import { baseCarInfo } from "@/models/car/Core/baseCarInfo";

import { blueprints } from "@/models/car/Core/blueprints";
import { stockStats } from "@/models/car/Stats/Stages/stockStats";
import { oneStarMaxStats } from "@/models/car/Stats/MaxStats/oneStarMaxStats";
import { twoStarMaxStats } from "@/models/car/Stats/MaxStats/twoStarMaxStats";
import { goldMaxStats } from "@/models/car/Stats/MaxStats/goldMaxStats";
import { threeStarMaxStats } from "@/models/car/Stats/MaxStats/threeStarMaxStats";
import { fourStarMaxStats } from "@/models/car/Stats/MaxStats/fourStarMaxStats";
import { fiveStarMaxStats } from "@/models/car/Stats/MaxStats/fiveStarMaxStats";
import { sixStarMaxStats } from "@/models/car/Stats/MaxStats/sixStarMaxStats";

const carSchemaFields = {
  _id: { type: Schema.Types.ObjectId, auto: true },
  ...baseCarInfo,
  ...blueprints,
  ...stockStats,
  ...oneStarMaxStats,
  ...twoStarMaxStats,
  ...threeStarMaxStats,
  ...fourStarMaxStats,
  ...fiveStarMaxStats,
  ...sixStarMaxStats,
  ...goldMaxStats
};

const carSchema = new Schema(carSchemaFields, { timestamps: true, versionKey: false });
const CarModel = mongoose.model("Car", carSchema);

export default CarModel;