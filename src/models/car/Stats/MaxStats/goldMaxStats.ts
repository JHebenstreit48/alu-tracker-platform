import { Schema } from 'mongoose';

export const goldMaxStats = {
  Gold_Max_Rank: { type: Schema.Types.Mixed, default: null },
  Gold_Top_Speed: { type: Schema.Types.Mixed, default: null },
  Gold_Acceleration: { type: Schema.Types.Mixed, default: null },
  Gold_Handling: { type: Schema.Types.Mixed, default: null },
  Gold_Nitro: { type: Schema.Types.Mixed, default: null },
};