import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config, isTest } from './config/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(currentDir, '..', 'client', 'dist');

/** CORS: allow the configured origin(s), or reflect the caller in development. */
function buildCorsOptions() {
  if (!config.clientOrigin) return { origin: true };
  return { origin: config.clientOrigin.split(',').map((origin) => origin.trim()) };
}

/**
 * Builds the Express application.
 * Exported as a factory so tests can create an isolated instance per suite.
 */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: config.jsonLimit }));

  // Request logging is noise in tests, so it is disabled there.
  if (!isTest) {
    app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
  }

  // The REST API. Everything the frontend talks to lives under /api.
  app.use('/api', apiRoutes);

  // Optional single-service deployment: in production the built React app is
  // served by Express when `npm run build` has produced client/dist.
  const clientIndexPath = path.join(clientDistPath, 'index.html');
  if (config.env === 'production' && fs.existsSync(clientIndexPath)) {
    app.use(express.static(clientDistPath));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      return res.sendFile(clientIndexPath);
    });
  }

  // Order matters: unknown routes first, then the single error handler.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();

export default app;
