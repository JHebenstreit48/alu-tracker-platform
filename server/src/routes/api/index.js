"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const car_1 = __importDefault(require("../../models/car"));
const router = express_1.default.Router();
// Fetch all cars of a specific class, sorted by Stars (ascending) and Brand (alphabetically)
router.get("/cars/:class", async (req, res) => {
    const carClass = req.params.class;
    try {
        const cars = await car_1.default.find({ Class: carClass }).sort({ Stars: 1, Brand: 1 });
        if (!cars || cars.length === 0) {
            return res.status(404).send("No cars found for the specified class.");
        }
        res.json(cars);
    }
    catch (error) {
        console.error("Error fetching cars by class:", error);
        res.status(500).send("Server Error");
    }
});
// Fetch a car by ID
router.get("/cars/detail/:id", async (req, res) => {
    const carId = parseInt(req.params.id, 10);
    try {
        const car = await car_1.default.findOne({ Id: carId });
        if (!car) {
            return res.status(404).send("Car not found");
        }
        res.json(car);
    }
    catch (error) {
        console.error("Error fetching car by ID:", error);
        res.status(500).send("Server Error");
    }
});
exports.default = router;
