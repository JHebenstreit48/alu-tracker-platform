import { Schema, model, Document } from "mongoose";

interface ICar extends Document {
    Id: number;
    Class: string;
    Order: number;
    Brand: string;
    Model: string;
    Rarity: string;
    Stars: number;
    MaxRank: number;
    Epics: number;
    ObtainableVia: string;
    GarageLv: number;
    TopSpeed: string;
    Acceleration: string;
    Handling: string;
    Nitro: string;
    NitroTS: string;
    Unnamed16: string;
    PerfectNitroTS: string | null;
    Added: string;
    AddedWith: string;
    AddedDate: string;
    TotalUpgradeCost: number | null;
    TotalGLPoints: number | null;
    Country: string;
    Tags: string;
    BPs1: string;
    BPs2: number;
    BPs3: number;
    BPs4: number | null;
    BPs5: number | null;
    BPs6: number | null;
    TotalBPs: number;
    Unnamed32: number;
    CostEpic: number;
}

const carSchema = new Schema<ICar>({
    Id: { type: Number, required: true },
    Class: { type: String, required: true },
    Order: { type: Number, required: true },
    Brand: { type: String, required: true },
    Model: { type: String, required: true },
    Rarity: { type: String, required: true },
    Stars: { type: Number, required: true },
    MaxRank: { type: Number, required: true },
    Epics: { type: Number, required: true },
    ObtainableVia: { type: String, required: true },
    GarageLv: { type: Number, required: true },
    TopSpeed: { type: String, required: true },
    Acceleration: { type: String, required: true },
    Handling: { type: String, required: true },
    Nitro: { type: String, required: true },
    NitroTS: { type: String, required: true },
    Unnamed16: { type: String, required: true },
    PerfectNitroTS: { type: String, default: null },
    Added: { type: String, required: true },
    AddedWith: { type: String, required: true },
    AddedDate: { type: String, required: true },
    TotalUpgradeCost: { type: Number, default: null },
    TotalGLPoints: { type: Number, default: null },
    Country: { type: String, required: true },
    Tags: { type: String, required: true },
    BPs1: { type: String, required: true },
    BPs2: { type: Number, required: true },
    BPs3: { type: Number, required: true },
    BPs4: { type: Number, default: null },
    BPs5: { type: Number, default: null },
    BPs6: { type: Number, default: null },
    TotalBPs: { type: Number, required: true },
    Unnamed32: { type: Number, required: true },
    CostEpic: { type: Number, required: true },
});

const CarModel = model<ICar>("Car", carSchema);

export default CarModel;
