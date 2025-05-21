import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import CarModel from '@/models/car/schema';

const router = Router();

// ============================
//       🚗 CAR ROUTES
// ============================

// GET /api/cars – paginated list
router.get('/', async (req: Request, res: Response): Promise<void> => {
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
      CarModel.find(filter).sort({ Brand: 1, Model: 1 }).skip(offset).limit(limit),
      CarModel.countDocuments(filter),
    ]);

    res.status(200).json({ cars, total });
  } catch (error) {
    console.error('[ERROR] Failed to fetch paginated cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// GET /api/cars/class/:class – cars by class
router.get('/class/:class', async (req: Request<{ class: string }>, res: Response): Promise<void> => {
  const carClass = req.params.class.trim();

  try {
    const cars = await CarModel.find({ Class: carClass });

    if (!cars || cars.length === 0) {
      console.log(`[INFO] No cars found for class: ${carClass}`);
      res.status(404).json({ message: 'No cars found for this class.' });
      return;
    }

    res.status(200).json(cars);
  } catch (error) {
    console.error(`[ERROR] Error in /cars/class/:class route:`, error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

// GET /api/cars/detail/:slug – by _id or normalizedKey
router.get('/detail/:slug', async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
  const { slug } = req.params;
  console.log(`🧪 Incoming request for slug: ${slug}`);

  if (!slug || slug.length < 3) {
    res.status(400).json({ error: 'Invalid ID or slug provided.' });
    return;
  }

  try {
    if (mongoose.Types.ObjectId.isValid(slug)) {
      const car = await CarModel.findById(slug);
      if (car) {
        res.json(car);
        return;
      }
    }

    const car = await CarModel.findOne({ normalizedKey: slug });
    if (!car) {
      res.status(404).json({ error: 'Car not found for the given ID or slug.' });
      return;
    }

    res.json(car);
  } catch (error) {
    console.error(`[ERROR] Failed to fetch car details for slug ${slug}:`, error);
    res.status(500).json({ error: 'Failed to fetch car details' });
  }
});

export default router;
