import express, { Request, Response, Router } from 'express';
import BlueprintPricesModel from '@/models/blueprints';
import ManufacturerModel from '@/models/manufacturers';
import GarageLevelModel from '@/models/garageLevels';
import mongoose from 'mongoose';

// ✅ Modular car route import
import carsRoutes from '@/routes/api/cars';
import statusRoutes from '@/routes/api/status';
import blueprintsRoutes from '@/routes/api/blueprints';
import manufacturersRoutes from '@/routes/api/manufacturers';

const router: Router = express.Router();

// ============================
//       🚗 CAR ROUTES
// ============================

router.use('/cars', carsRoutes); //

// ============================
//       📊 STATUS ROUTES
// ============================
router.use('/status', statusRoutes);

// ============================
//    🧱 BLUEPRINT ROUTES
// ============================

router.use('/', blueprintsRoutes);

// ============================
//    🧱 MANUFACTURERS ROUTES
// ============================

router.use('/', manufacturersRoutes);

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