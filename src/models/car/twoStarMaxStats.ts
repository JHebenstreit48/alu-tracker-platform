import { Schema } from 'mongoose';

export const twoStarMaxStats = {
  Two_Star_Max_Rank: { type: Schema.Types.Mixed, default: null },
  Two_Star_Max_Top_Speed: { type: Schema.Types.Mixed, default: null },
  Two_Star_Max_Acceleration: { type: Schema.Types.Mixed, default: null },
  Two_Star_Max_Handling: { type: Schema.Types.Mixed, default: null },
  Two_Star_Max_Nitro: { type: Schema.Types.Mixed, default: null },
};