import express, { Request, Response, Router } from 'express';

// Modular car route import
import carsRoutes from '@/routes/api/cars';
import statusRoutes from '@/routes/api/status';

const router: Router = express.Router();

// ============================
//       🚗 CAR ROUTES
// ============================

router.use('/cars', carsRoutes); //

// ============================
//       📊 STATUS ROUTES
// ============================

router.use('/status', statusRoutes);

export default router;