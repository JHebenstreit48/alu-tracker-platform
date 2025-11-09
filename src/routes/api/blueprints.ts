import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import BlueprintPricesModel from "@/models/blueprints";

const router = Router();

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

  export default router;