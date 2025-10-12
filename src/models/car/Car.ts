import { baseCarInfo } from "@/models/car/Core/baseCarInfo";
import { blueprints } from "@/models/car/Core/blueprints";
import { stockStats } from "@/models/car/Stats/Stages/stockStats";
import { oneStarMaxStats } from "@/models/car/Stats/MaxStats/oneStarMaxStats";
import { twoStarMaxStats } from "@/models/car/Stats/MaxStats/twoStarMaxStats";
import { threeStarMaxStats } from "@/models/car/Stats/MaxStats/threeStarMaxStats";
import { fourStarMaxStats } from "@/models/car/Stats/MaxStats/fourStarMaxStats";
import { fiveStarMaxStats } from "@/models/car/Stats/MaxStats/fiveStarMaxStats";
import { sixStarMaxStats } from "@/models/car/Stats/MaxStats/sixStarMaxStats";
import { goldMaxStats } from "@/models/car/Stats/MaxStats/goldMaxStats";

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