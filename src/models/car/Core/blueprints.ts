import { Schema } from "mongoose";

export const blueprints = {
  BPs_1_Star: { type: Schema.Types.Mixed },
  BPs_2_Star: { type: Schema.Types.Mixed },
  BPs_3_Star: { type: Schema.Types.Mixed },
  BPs_4_Star: { type: Schema.Types.Mixed },
  BPs_5_Star: { type: Schema.Types.Mixed, default: null },
  BPs_6_Star: { type: Schema.Types.Mixed, default: null },
  Total_BPs:  { type: Schema.Types.Mixed },
};