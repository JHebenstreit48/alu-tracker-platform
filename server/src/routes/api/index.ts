import express, { Request, Response, Router } from "express";
import CarModel from "@/models/car";
import mongoose from "mongoose";

const router: Router = express.Router();

router.get("/cars", async (_req: Request, res: Response): Promise<void> => {
  try {
    const cars = await CarModel.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

router.get(
  "/cars/:class",
  async (req: Request<{ class: string }>, res: Response): Promise<void> => {
    const carClass = req.params.class.trim(); // Added trim for safety
    try {
      const cars = await CarModel.find({ Class: carClass });

      if (!cars || cars.length === 0) {
        console.log(`[INFO] No cars found for class: ${carClass}`);
        res.status(404).json({ message: "No cars found for this class." });
        return;
      }

      res.status(200).json(cars);
    } catch (error) {
      console.error(`[ERROR] Error in /cars/:class route:`, error);
      res.status(500).json({
        error: "Internal server error",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

router.get(
  "/cars/detail/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id || id.length < 5) {
      res.status(400).json({ error: "Invalid ID provided." });
      return;
    }

    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const car = await CarModel.findById(id);
        if (!car) {
          res.status(404).json({ error: "Car not found for the given ID." });
          return;
        }
        res.json(car);
      } else {
        const car = await CarModel.findOne({ customId: id });
        if (!car) {
          res
            .status(404)
            .json({ error: "Car not found for the given custom ID." });
          return;
        }
        res.json(car);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to fetch car details for ID ${id}:`, error);
      res.status(500).json({ error: "Failed to fetch car details" });
    }
  }
);

export default router;
