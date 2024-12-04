import express, { Request, Response, Router } from "express";
import CarModel from "../../models/car";
import mongoose from "mongoose";

const router: Router = express.Router();

router.get(
  "/cars",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const cars = await CarModel.find();
      res.status(200).json(cars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cars" });
    }
  }
);


// Define the route
router.get(
  "/cars/:class",
  async (req: Request<{ class: string }>, res: Response): Promise<void> => {
    const carClass = req.params.class; // Extract the 'class' parameter from the URL
    try {
      // Query the database for cars with the specified class
      const cars = await CarModel.find({ Class: carClass });
      console.log(cars);


      if (!cars || cars.length === 0) {
        res.status(404).json({ message: "No cars found for this class." });
        return;
      }
      res.status(200).json(cars); // Send the cars as JSON
    } catch (error) {
      console.error("Error in /api/cars/:class route:", error);

      // Handle 'unknown' type for error
      if (error instanceof Error) {
        res.status(500).json({
          error: "Internal server error",
          details: error.message, // Access 'message' safely
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
          details: "An unknown error occurred", // Fallback for non-Error types
        });
      }
    }
  }
);

router.get(
  "/cars/detail/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params;
    console.log("Fetching car details for ID:", id);

    try {
      // Check if the ID is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        const car = await CarModel.findById(id);

        if (!car) {
          console.log("Car not found for ObjectId:", id);
          res.status(404).json({ error: "Car not found" });
          return;
        }

        res.json(car); // Return the car details
        return;
      }

      // If not a valid ObjectId, query by customId
      const car = await CarModel.findOne({ customId: id });
      if (!car) {
        console.log("Car not found for customId:", id);
        res.status(404).json({ error: "Car not found" });
        return;
      }

      res.json(car); // Return the car details
    } catch (error) {
      console.error("Error fetching car details:", error);
      res.status(500).json({ error: "Failed to fetch car details" });
    }
  }
);

export default router;

