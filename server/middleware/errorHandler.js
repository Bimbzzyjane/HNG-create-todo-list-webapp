import { AppError } from '../utils/AppError.js';
import { config, isTest } from '../config/index.js';

/**
 * The single place where errors become HTTP responses.
 *
 * Response shape (kept identical for every failure so the frontend only needs
 * one piece of error handling code):
 *   { "error": { "message": "...", "status": 400, "code": "...", "details": [] } }
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity
export function errorHandler(error, req, res, next) {
  const normalized = normalizeError(error);

  if (normalized.status >= 500 && !isTest) {
    console.error('[api-error]', error);
  }

  res.status(normalized.status).json({
    error: {
      message: normalized.message,
      status: normalized.status,
      code: normalized.code,
      details: normalized.details,
    },
  });
}

/** Converts any thrown value into the AppError shape. */
function normalizeError(error) {
  if (error instanceof AppError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details ?? [],
    };
  }

  // Malformed JSON body produced by express.json()
  if (error instanceof SyntaxError && 'body' in error) {
    return {
      status: 400,
      code: 'MALFORMED_JSON',
      message: 'Request body contains invalid JSON',
      details: [{ field: 'body', message: 'Check the JSON syntax of the request body' }],
    };
  }

  return {
    status: error.status || 500,
    code: 'INTERNAL_ERROR',
    message:
      config.env === 'production'
        ? 'Something went wrong on the server'
        : error.message || 'Something went wrong on the server',
    details: [],
  };
}
