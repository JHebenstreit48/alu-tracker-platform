import express, { Request, Response } from "express";
import CarModel from "../../models/car";

const router = express.Router();

router.get("/api/cars/detail/:id", async (req: Request, res: Response, ): Promise<void> => {
  try {
    const carId = parseInt(req.params.id); // Parse ID as an integer
    const car = await CarModel.findOne({ Id: carId }); // Query database for the car

    if (!car) {
      res.status(404).json({ message: "Car not found" });
      return; // Ensure the function stops after sending a response
    }

    res.status(200).json(car); // Send the car details as JSON
  } catch (error) {
  }
});

export default router;