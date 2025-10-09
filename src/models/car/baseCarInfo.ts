import { Schema } from "mongoose";

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

  // Accepts string | string[] | null (no extra parsing; your other files handle normalization)
  ObtainableVia: {
    type: Schema.Types.Mixed,
    default: null,
    set(v: unknown) {
      if (v == null) return null;
      if (typeof v === "string") return v;
      if (Array.isArray(v)) return v;
      return null;
    },
  },

  Stars: { type: Number },
  KeyCar: { type: Boolean, default: false },
  Added: { type: String },
  Added_With: { type: String, default: null },
  Added_Date: { type: String },
  Tags: { type: String },
  Cost_Epic: { type: Number, default: null },
  normalizedKey: { type: String, required: true, unique: true },
};