import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import ManufacturerModel from '@/models/manufacturers';

const router = Router();

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

    export default router;