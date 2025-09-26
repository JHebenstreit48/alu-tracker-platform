import { Router, Request, Response } from "express";
import CarModel from "@/models/car/schema";
import CarDataStatus from "@/models/car/dataStatus";

const router = Router();

// Helper to mirror how your slugs are built
const toNormalizedKey = (brand: string, model: string) =>
  `${brand}-${model}`.toLowerCase().replace(/\s+/g, "-");

/**
 * GET /api/status?brand=Ultima&model=RS
 * 204 = no status doc (FE can just show nothing)
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const brand = String(req.query.brand || "").trim();
  const model = String(req.query.model || "").trim();

  if (!brand || !model) {
    res.status(400).json({ error: "brand and model required" });
    return;
  }

  const normalizedKey = toNormalizedKey(brand, model);
  const s = await CarDataStatus.findOne({ normalizedKey }).lean();

  if (!s) {
    res.status(204).end();
    return;
  }

  res.json({
    status: s.status,
    message: s.message,
    lastChecked: s.updatedAt,
  });
});

/**
 * GET /api/status/by-slug/:slug
 * Works great from /api/cars/detail/:slug pages.
 */
router.get(
  "/by-slug/:slug",
  async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
    const slug = String(req.params.slug || "");
    if (!slug) {
      res.status(400).json({ error: "slug required" });
      return;
    }

    // Optional: verify car exists for nicer 404
    const car = await CarModel.findOne({ normalizedKey: slug }, { _id: 1 }).lean();
    if (!car) {
      res.status(404).json({ error: "Car not found" });
      return;
    }

    const s = await CarDataStatus.findOne({ normalizedKey: slug }).lean();
    if (!s) {
      res.status(204).end();
      return;
    }

    res.json({
      status: s.status,
      message: s.message,
      lastChecked: s.updatedAt,
    });
  }
);

export default router;