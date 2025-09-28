import { Schema } from "mongoose";

export const stockStats = {
  Stock_Rank:         { type: Schema.Types.Mixed, default: null },
  Stock_Top_Speed:    { type: Schema.Types.Mixed, default: null },
  Stock_Acceleration: { type: Schema.Types.Mixed, default: null },
  Stock_Handling:     { type: Schema.Types.Mixed, default: null },
  Stock_Nitro:        { type: Schema.Types.Mixed, default: null },
}