import { baseCarInfo } from "@/models/car/baseCarInfo";
import { blueprints } from "@/models/car/blueprints";
import { stockStats } from "@/models/car/stockStats";
import { oneStarMaxStats } from "@/models/car/oneStarMaxStats";
import { twoStarMaxStats } from "@/models/car/twoStarMaxStats";
import { threeStarMaxStats } from "@/models/car/threeStarMaxStats";
import { fourStarMaxStats } from "@/models/car/fourStarMaxStats";
import { fiveStarMaxStats } from "@/models/car/fiveStarMaxStats";
import { sixStarMaxStats } from "@/models/car/sixStarMaxStats";
import { goldMaxStats } from "@/models/car/goldMaxStats";

// ✅ Utility type to extract all keys as optional fields
type ExtractKeys<T> = {
  [K in keyof T]?: any;
};

// ✅ Final Car type composed from all schema field sets
export type Car = {
  _id?: string;
} & ExtractKeys<typeof baseCarInfo>
  & ExtractKeys<typeof blueprints>
  & ExtractKeys<typeof stockStats>
  & ExtractKeys<typeof oneStarMaxStats>
  & ExtractKeys<typeof twoStarMaxStats>
  & ExtractKeys<typeof threeStarMaxStats>
  & ExtractKeys<typeof fourStarMaxStats>
  & ExtractKeys<typeof fiveStarMaxStats>
  & ExtractKeys<typeof sixStarMaxStats>
  & ExtractKeys<typeof goldMaxStats>;