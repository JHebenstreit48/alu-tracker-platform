import { baseCarInfo } from "@/models/car/baseCarInfo";
import { blueprints } from "@/models/car/blueprints";
import { stockStats } from "@/models/car/stockStats";
import { oneStarStockStats } from "@/models/car/oneStarStockStats";
import { twoStarStockStats } from "@/models/car/twoStarStockStats";
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
  & ExtractKeys<typeof oneStarStockStats>
  & ExtractKeys<typeof twoStarStockStats>
  & ExtractKeys<typeof goldMaxStats>;
