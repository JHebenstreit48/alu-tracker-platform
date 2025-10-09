import { obtainableViaField } from "@/models/car/obtainableVia";

export const baseCarInfo = {
  Image: { type: String, required: false },
  ImageStatus: {
    type: String,
    enum: ["Available", "Coming Soon", "Removed"],
    default: "Available",
  },
  Class: { type: String, required: true },
  Brand: { type: String, required: true },
  Model: { type: String, required: true },
  Rarity: { type: String },
  Country: { type: String },

  // Accepts array | string | null; stored as array-of-objects or null
  ObtainableVia: obtainableViaField,

  Stars: { type: Number },
  KeyCar: { type: Boolean, default: false },
  Added: { type: String },
  Added_With: { type: String, default: null },
  Added_Date: { type: String },
  Tags: { type: String },
  Cost_Epic: { type: Number, default: null },

  normalizedKey: { type: String, required: true, unique: true },
};