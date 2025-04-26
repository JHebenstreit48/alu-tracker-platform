import mongoose, { Schema, Document, Types } from "mongoose";

// Interface for Manufacturer document
interface IManufacturer extends Document {
  _id: Types.ObjectId;
  brand: string;
  slug: string;
  description: string;
  logo: string;
  country: string;
  established: number;
  headquarters?: string;
  primaryMarket?: string;
  location: {
    lat: number;
    lng: number;
  };
  resources?: {
    text: string;
    url: string;
  }[];
}

// Define the schema
const manufacturerSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },

  brand: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  logo: { type: String, required: true },

  country: { type: String, required: true },
  established: { type: Number, required: true },
  headquarters: { type: String, required: false },
  primaryMarket: { type: String, required: false },

  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  resources: [
    {
      text: { type: String, required: true },
      url: { type: String, required: true }
    }
  ]
});

// Create and export the model
const ManufacturerModel = mongoose.model<IManufacturer>("Manufacturer", manufacturerSchema);
export default ManufacturerModel;
