import { Router, Request, Response } from 'express';
import GarageLevelModel from '@/models/garageLevels';

const router = Router();

/**
 * GET /api/garage-levels – list all levels (sorted)
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
      const levels = await GarageLevelModel.find().sort({ GarageLevelKey: 1 }).lean();
  
      if (!levels || levels.length === 0) {
        res.status(404).json({ message: 'No garage levels found.' });
        return;
      }
  
      res.status(200).json(levels);
    } catch (error) {
      console.error('[ERROR] Failed to fetch garage levels:', error);
      res.status(500).json({ error: 'Failed to fetch garage levels' });
    }
  });
  
  /**
   * GET /api/garage-levels/:key – single level by key
   */
  router.get('/:key', async (req: Request<{ key: string }>, res: Response): Promise<void> => {
    const key = Number.parseInt(req.params.key, 10);
  
    if (!Number.isFinite(key)) {
      res.status(400).json({ error: 'Invalid garage level key.' });
      return;
    }
  
    try {
      const level = await GarageLevelModel.findOne({ GarageLevelKey: key }).lean();
  
      if (!level) {
        res.status(404).json({ message: 'Garage level not found for this key.' });
        return;
      }
  
      res.status(200).json(level);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch garage level ${key}:`, error);
      res.status(500).json({ error: 'Failed to fetch garage level detail' });
    }
  });
  
  export default router;