import express, { Request, Response } from "express";
import CarModel from "../../models/car";

const router = express.Router();

router.get("/cars/detail/:id", async (req: Request, res: Response, ): Promise<void> => {
  try {
    const car = await CarModel.findOne({ _id: req.params.id }); // Query database for the car

    if (!car) {
      res.status(404).json({ message: "Car not found" });
      return; // Ensure the function stops after sending a response
    }

    res.status(200).json(car); // Send the car details as JSON
  } catch (error) {
    res.status(500).json({ message: "Car not found" });
  }
});

  router.get("/api/cars/:selectedClass", async (req: Request, res: Response): Promise<void> => {
    try {
      const selectedClass = await CarModel.find({ _selectedClass: req.params.selectedClass }); // Query database for the car

      if (!selectedClass) {
        res.status(404).json({ message: "Class not found" });
        return; // Ensure the function stops after sending a response
      }

      res.status(200).json(selectedClass); // Send the car details as JSON
    } catch (error) {
      res.status(500).json({ message: "Class not found" });
    }
});

export default router;