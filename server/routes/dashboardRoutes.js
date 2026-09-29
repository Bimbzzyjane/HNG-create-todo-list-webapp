import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

/** Dashboard routes - statistics only. */
const router = Router();

router.get('/stats', dashboardController.getStats);

export default router;
