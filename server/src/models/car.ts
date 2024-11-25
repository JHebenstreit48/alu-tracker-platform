import { Schema, model } from "mongoose";

const CarSchema = new Schema({
    Id: { type: Number, required: true },
    Class: { type: String, required: true },
    Order: { type: Number },
    Brand: { type: String, required: true },
    Model: { type: String, required: true },
    Rarity: { type: String },
    Stars: { type: Number },
    MaxRank: { type: Number, alias: "Max Rank" },
    Epics: { type: Number },
    ObtainableVia: { type: String, alias: "Obtainable via" },
    GarageLevel: { type: Number, alias: "Garage Lv" },
    TopSpeed: { type: String, alias: "Top Speed" },
    Acceleration: { type: String },
    Handling: { type: String },
    Nitro: { type: String },
    NitroTS: { type: String, alias: "Nitro TS" },
    PerfectNitroTS: { type: String, alias: "Perfect nitro TS" },
    Added: { type: String },
    AddedWith: { type: String, alias: "Added with" },
    AddedDate: { type: String, alias: "Added date" },
    TotalUpgradeCost: { type: Number, alias: "Total upgrade cost" },
    TotalGLPoints: { type: Number, alias: "Total GL points" },
    Country: { type: String },
    Tags: { type: String },
    Blueprints1: { type: String, alias: "BPs 1*" },
    Blueprints2: { type: Number, alias: "BPs 2*" },
    Blueprints3: { type: Number, alias: "BPs 3*" },
    Blueprints4: { type: Number, alias: "BPs 4*", required: false, default: null },
    Blueprints5: { type: Number, alias: "BPs 5*", required: false, default: null },
    Blueprints6: { type: Number, alias: "BPs 6*", required: false, default: null },
    TotalBlueprints: { type: Number, alias: "Total BPs" },
    Unnamed: { type: Number, alias: "Unnamed: 32" },
    CostEpic: { type: Number, alias: "Cost epic" }
}, { collection: 'cars' }); // Make sure the collection name matches your database

export default model("Car", CarSchema);
