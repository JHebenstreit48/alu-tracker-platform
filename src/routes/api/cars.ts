import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import CarModel from '@/models/car/schema';
import { withImageUrl } from '@/Utility/imageUrl';
import { formatObtainableViaDisplay } from '@/models/car/Core/obtainableVia';

const router = Router();

/**
 * Server caps the page size (does NOT cap total).
 * Bump if you want bigger pages; value doesn't affect total.
 */
const MAX_PAGE_SIZE = 500;

/** Parse positive int with fallback */
function parsePositiveInt(v: unknown, fallback: number): number {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * GET /api/cars  – paginated list
 *
 * Supports BOTH:
 *   - New style:   ?page=1&pageSize=25
 *   - Legacy:      ?offset=0&limit=25
 *
 * Filters:
 *   - ?class=A|B|C|D|S      (All Classes is ignored)
 *   - ?search=term          (Brand/Model regex)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // ---- pagination params (new preferred: page/pageSize)
    const hasLegacy = req.query.offset != null || req.query.limit != null;

    let page = parsePositiveInt(req.query.page, 1);
    let pageSize = Math.min(parsePositiveInt(req.query.pageSize, 25), MAX_PAGE_SIZE);

    if (hasLegacy) {
      // Back-compat: compute page from offset/limit if given
      const limit = Math.min(parsePositiveInt(req.query.limit, 25), MAX_PAGE_SIZE);
      const offset = Math.max(parsePositiveInt(req.query.offset, 0), 0);
      pageSize = limit;
      page = Math.floor(offset / pageSize) + 1;
    }

    // ---- filters
    const selectedClass = (req.query.class as string | undefined)?.trim();
    const searchTerm = req.query.search?.toString().trim();

    const filter: Record<string, any> = {};
    if (selectedClass && selectedClass !== 'All Classes') {
      filter.Class = selectedClass;
    }
    if (searchTerm && searchTerm.length) {
      filter.$or = [
        { Brand: { $regex: searchTerm, $options: 'i' } },
        { Model: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      CarModel.find(filter)
        .sort({ Brand: 1, Model: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      CarModel.countDocuments(filter),
    ]);

    const safeItems = items.map((car: any) => ({
      ...car,
      Image: withImageUrl(car?.Image), // prefix to absolute URL
      ObtainableVia: formatObtainableViaDisplay(car?.ObtainableVia),
    }));

    // New shape (preferred): { items, total, page, pageSize }
    // Old shape alias for FE back-compat: { cars: items }
    res.status(200).json({
      items: safeItems,
      cars: safeItems, // alias for current FE usage
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('[ERROR] Failed to fetch paginated cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

/**
 * GET /api/cars/brands – distinct list of brands (full set, not paginated)
 * Use this for the Brands dropdown so it includes U, Z, etc.
 */
router.get('/brands', async (_req: Request, res: Response): Promise<void> => {
  try {
    const brands: string[] = await CarModel.distinct('Brand');
    brands.sort((a, b) => a.localeCompare(b));
    res.status(200).json({ brands, total: brands.length });
  } catch (error) {
    console.error('[ERROR] /api/cars/brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

/**
 * GET /api/cars/class/:class – all cars in a class (unpaged)
 */
router.get(
  '/class/:class',
  async (req: Request<{ class: string }>, res: Response): Promise<void> => {
    const carClass = req.params.class.trim();

    try {
      const cars = await CarModel.find({ Class: carClass }).lean();

      if (!cars || cars.length === 0) {
        console.log(`[INFO] No cars found for class: ${carClass}`);
        res.status(404).json({ message: 'No cars found for this class.' });
        return;
      }

      const safeCars = cars.map((car: any) => ({
        ...car,
        Image: withImageUrl(car?.Image), // prefix to absolute URL
        ObtainableVia: formatObtainableViaDisplay(car?.ObtainableVia),
      }));

      res.status(200).json(safeCars);
    } catch (error) {
      console.error(`[ERROR] Error in /cars/class/:class route:`, error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
);

/**
 * GET /api/cars/detail/:slug – lookup by _id or normalizedKey
 */
router.get(
  '/detail/:slug',
  async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
    const { slug } = req.params;
    console.log(`🧪 Incoming request for slug: ${slug}`);

    if (!slug || slug.length < 3) {
      res.status(400).json({ error: 'Invalid ID or slug provided.' });
      return;
    }

    try {
      // Try ObjectId first
      if (mongoose.Types.ObjectId.isValid(slug)) {
        const carById = await CarModel.findById(slug).lean();
        if (carById) {
          carById.ObtainableVia = formatObtainableViaDisplay(carById.ObtainableVia);
          (carById as any).Image = withImageUrl((carById as any).Image); // make absolute
          res.json(carById);
          return;
        }
      }

      // Fallback: normalizedKey
      const car = await CarModel.findOne({ normalizedKey: slug }).lean();
      if (!car) {
        res.status(404).json({ error: 'Car not found for the given ID or slug.' });
        return;
      }

      car.ObtainableVia = formatObtainableViaDisplay(car.ObtainableVia);
      (car as any).Image = withImageUrl((car as any).Image); // make absolute
      res.json(car);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch car details for slug ${slug}:`, error);
      res.status(500).json({ error: 'Failed to fetch car details' });
    }
  }
);

export default router;