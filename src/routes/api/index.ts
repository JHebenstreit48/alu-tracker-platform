import express, { Request, Response, Router } from 'express';

// Modular car route import
import carsRoutes from '@/routes/api/cars';
import statusRoutes from '@/routes/api/status';
import blueprintsRoutes from '@/routes/api/blueprints';
import manufacturersRoutes from '@/routes/api/manufacturers';
import garageLevelsRoutes from '@/routes/api/garageLevels';

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

router.use('/garage-levels', garageLevelsRoutes);

export default router;