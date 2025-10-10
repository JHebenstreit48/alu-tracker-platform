import mongoose, { Schema } from "mongoose";
import { baseCarInfo } from "@/models/car/baseCarInfo";

import { blueprints } from "@/models/car/blueprints";
import { stockStats } from "@/models/car/stockStats";
import { oneStarMaxStats } from "@/models/car/oneStarMaxStats";
import { twoStarMaxStats } from "@/models/car/twoStarMaxStats";
import { goldMaxStats } from "@/models/car/goldMaxStats";
import { threeStarMaxStats } from "@/models/car/threeStarMaxStats";
import { fourStarMaxStats } from "@/models/car/fourStarMaxStats";
import { fiveStarMaxStats } from "@/models/car/fiveStarMaxStats";
import { sixStarMaxStats } from "@/models/car/sixStarMaxStats";

import { formatObtainableViaDisplay } from "@/models/car/obtainableVia";

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

// Prevent serialization crashes
carSchema.set("toJSON", {
  transform: (_doc, ret) => {
    try {
      if ("ObtainableVia" in ret) {
        ret.ObtainableVia = formatObtainableViaDisplay(ret.ObtainableVia);
      }
    } catch {
      // leave it untouched if formatting fails
    }
    return ret;
  }
});

const CarModel = mongoose.model("Car", carSchema);
export default CarModel;