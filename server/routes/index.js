import { Router } from 'express';
import todoRoutes from './todoRoutes.js';
import noteRoutes from './noteRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import { collectionSize } from '../data/memoryStore.js';
import { config } from '../config/index.js';

/**
 * The /api router. Everything below this file describes the public REST surface.
 */
const router = Router();

/** GET /api/health - quick check that the API and its store are alive. */
router.get('/health', (req, res) => {
  res.status(200).json({
    data: {
      status: 'ok',
      environment: config.env,
      storage: 'in-memory',
      counts: {
        todos: collectionSize('todos'),
        notes: collectionSize('notes'),
      },
      uptimeSeconds: Math.round(process.uptime()),
    },
  });
});

router.use('/todos', todoRoutes);
router.use('/notes', noteRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
