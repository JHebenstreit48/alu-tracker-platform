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

router.get("/api/cars/detail/:id", async (req: Request, res: Response,): Promise<void> => {
  // console.log("It's working");
  // res.status(200).json([]);
  // return;
  try {
    const carId = parseInt(req.params.id); // Parse ID as an integer
    const car = await CarModel.findOne({ Id: carId }); // Query database for the car

    if (!car) {
      res.status(404).json({ message: "Car not found" });
      return; // Ensure the function stops after sending a response
    }

    res.status(200).json(car); // Send the car details as JSON
  } catch (error) {
    console.log(error);
  }
}
);

export default router;

