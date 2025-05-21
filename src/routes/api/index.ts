import express, { Request, Response, Router } from 'express';
import CarModel from "@/models/car/schema";
import BlueprintPricesModel from '@/models/blueprints';
import ManufacturerModel from '@/models/manufacturers';
import GarageLevelModel from '@/models/garageLevels';

import mongoose from 'mongoose';

const router: Router = express.Router();

// ============================
//       🚗 CAR ROUTES
// ============================

router.get('/cars', async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 25;
  const offset = parseInt(req.query.offset as string) || 0;
  const selectedClass = req.query.class as string | undefined;
  const searchTerm = req.query.search?.toString().toLowerCase();

  try {
    const filter: Record<string, any> = {};

    if (selectedClass && selectedClass !== 'All Classes') {
      filter.Class = selectedClass;
    }

    if (searchTerm) {
      filter.$or = [
        { Brand: { $regex: searchTerm, $options: 'i' } },
        { Model: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const [cars, total] = await Promise.all([
      CarModel.find(filter)
        .sort({ Brand: 1, Model: 1 }) // ✅ Ensure consistent and predictable order
        .skip(offset)
        .limit(limit),
      CarModel.countDocuments(filter),
    ]);

    res.status(200).json({ cars, total });
  } catch (error) {
    console.error('[ERROR] Failed to fetch paginated cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});


router.get(
  '/cars/:class',
  async (req: Request<{ class: string }>, res: Response): Promise<void> => {
    const carClass = req.params.class.trim(); // Added trim for safety
    try {
      const cars = await CarModel.find({ Class: carClass });

      if (!cars || cars.length === 0) {
        console.log(`[INFO] No cars found for class: ${carClass}`);
        res.status(404).json({ message: 'No cars found for this class.' });
        return;
      }

      res.status(200).json(cars);
    } catch (error) {
      console.error(`[ERROR] Error in /cars/:class route:`, error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
);

router.get(
  '/cars/detail/:slug',
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id || id.length < 5) {
      res.status(400).json({ error: 'Invalid ID provided.' });
      return;
    }

    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const car = await CarModel.findById(id);
        if (!car) {
          res.status(404).json({ error: 'Car not found for the given ID.' });
          return;
        }
        res.json(car);
      } else {
        const car = await CarModel.findOne({ customId: id });
        if (!car) {
          res.status(404).json({ error: 'Car not found for the given custom ID.' });
          return;
        }
        res.json(car);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to fetch car details for ID ${id}:`, error);
      res.status(500).json({ error: 'Failed to fetch car details' });
    }
  }
);

// ============================
//    🧱 BLUEPRINT ROUTES
// ============================

router.get('/blueprints', async (_req: Request, res: Response): Promise<void> => {
  try {
    const blueprints = await BlueprintPricesModel.find();
    res.status(200).json(blueprints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blueprint data' });
  }
});

// GET blueprints by class
router.get(
  '/blueprints/class/:class',
  async (req: Request<{ class: string }>, res: Response): Promise<void> => {
    const carClass = req.params.class.trim().toUpperCase();

    try {
      const entries = await BlueprintPricesModel.find({ Class: carClass });

      if (!entries || entries.length === 0) {
        console.log(`[INFO] No blueprints found for class: ${carClass}`);
        res.status(404).json({ message: 'No blueprints found for this class.' });
        return;
      }

      res.status(200).json(entries);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch blueprints for class ${carClass}:`, error);
      res.status(500).json({ error: 'Failed to fetch blueprints' });
    }
  }
);

// GET blueprint by MongoDB _id
router.get(
  '/blueprints/detail/:id',
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id || id.length < 5) {
      res.status(400).json({ error: 'Invalid ID provided.' });
      return;
    }

    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const blueprint = await BlueprintPricesModel.findById(id);
        if (!blueprint) {
          res.status(404).json({ error: 'Blueprint entry not found for this ID.' });
          return;
        }
        res.json(blueprint);
      } else {
        res.status(400).json({ error: 'Invalid Object ID format.' });
      }
    } catch (error) {
      console.error(`[ERROR] Failed to fetch blueprint detail for ID ${id}:`, error);
      res.status(500).json({ error: 'Failed to fetch blueprint detail' });
    }
  }
);

// ============================
//    🧱 MANUFACTURERS ROUTES
// ============================

router.get('/manufacturers', async (_req: Request, res: Response): Promise<void> => {
  try {
    const manufacturers = await ManufacturerModel.find();
    res.status(200).json(manufacturers);
  } catch (error) {
    console.error(`[ERROR] Failed to fetch manufacturers:`, error);
    res.status(500).json({ error: 'Failed to fetch manufacturers' });
  }
});

// (Optional) Get manufacturer by slug — cleaner URLs
router.get(
  '/manufacturers/:slug',
  async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
    const { slug } = req.params;

    try {
      const manufacturer = await ManufacturerModel.findOne({ slug });

      if (!manufacturer) {
        res.status(404).json({ message: 'Manufacturer not found for this slug.' });
        return;
      }

      res.status(200).json(manufacturer);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch manufacturer for slug ${slug}:`, error);
      res.status(500).json({ error: 'Failed to fetch manufacturer detail' });
    }
  }
);

// =========================================
//       🏆 Garage Levels ROUTES
// =========================================

router.get('/garage-levels', async (_req: Request, res: Response): Promise<void> => {
  try {
    const levels = await GarageLevelModel.find();

    if (!levels || levels.length === 0) {
      console.log('[INFO] No garage levels found.');
      res.status(404).json({ message: 'No garage levels found.' });
      return;
    }

    res.status(200).json(levels);
  } catch (error) {
    console.error('[ERROR] Failed to fetch garage levels:', error);
    res.status(500).json({ error: 'Failed to fetch garage levels' });
  }
});

// (Optional) Get single garage level by key
router.get(
  '/garage-levels/:key',
  async (req: Request<{ key: string }>, res: Response): Promise<void> => {
    const key = parseInt(req.params.key);

    if (isNaN(key)) {
      res.status(400).json({ error: 'Invalid garage level key.' });
      return;
    }

    try {
      const level = await GarageLevelModel.findOne({ GarageLevelKey: key });

      if (!level) {
        res.status(404).json({ message: 'Garage level not found for this key.' });
        return;
      }

      res.status(200).json(level);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch garage level ${key}:`, error);
      res.status(500).json({ error: 'Failed to fetch garage level detail' });
    }
  }
);

export default router;
