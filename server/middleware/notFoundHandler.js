import { AppError } from '../utils/AppError.js';

/** 404 handler for unknown API routes. */
export function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}
