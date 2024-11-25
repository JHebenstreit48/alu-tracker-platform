import express from "express";
import CarModel from "../../models/car"; // This already leverages mongoose via the CarModel schema

const router = express.Router();

// Fetch all cars of a specific class
router.get("/cars/:class", async (req, res) => {
    const carClass = req.params.class;
    try {
        const cars = await CarModel.find({ Class: carClass }).sort({ Brand: 1, Model: 1 });
        console.log("Fetched cars:", cars); // Debug log
        res.json(cars);
    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(500).send("Server Error");
    }
});

export default router;
