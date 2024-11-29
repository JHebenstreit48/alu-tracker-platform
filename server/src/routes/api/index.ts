import express, { Request, Response, Router } from "express";
import CarModel from "../../models/car";

const router: Router = express.Router();

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

export default router;
