import mongoose, { Schema, Document, Model } from "mongoose";

export type CarDataStatusPublic = {
  status: "complete" | "in progress" | "missing" | "unknown";
  message?: string;
  lastChecked: string;
};

export interface CarDataStatusDoc extends Document {
  Brand: string;
  Model: string;
  normalizedKey: string;
  status: CarDataStatusPublic["status"];
  message?: string;
  sources?: string[];
  createdAt: Date;
  updatedAt: Date; // use as “last checked”
}

const schema = new Schema<CarDataStatusDoc>(
  {
    Brand: { type: String, required: true, index: true },
    Model: { type: String, required: true, index: true },
    normalizedKey: { type: String, required: true, unique: true },

    status: {
      type: String,
      enum: ["complete", "in progress", "missing", "unknown"],
      default: "unknown",
      index: true,
    },

    message: { type: String, default: "" },
    sources: [{ type: String }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const CarDataStatus: Model<CarDataStatusDoc> =
  mongoose.models.CarDataStatus ||
  mongoose.model<CarDataStatusDoc>("CarDataStatus", schema);

export default CarDataStatus;