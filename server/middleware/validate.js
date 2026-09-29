import { AppError } from '../utils/AppError.js';
import { isValidId } from '../utils/idGenerator.js';

/**
 * Validation middleware.
 *
 * Controllers read validated, normalised data from `req.validated` instead of
 * `req.body` / `req.query`. Express 5 makes `req.query` read-only, and keeping a
 * single trusted location avoids the classic bug of using raw user input.
 */

/** Validate and normalise the request body. */
export function validateBody(validator) {
  return function validateBodyMiddleware(req, res, next) {
    try {
      req.validated = { ...(req.validated || {}), body: validator(req.body) };
      next();
    } catch (error) {
      next(error);
    }
  };
}

/** Validate and normalise the query string. */
export function validateQuery(validator) {
  return function validateQueryMiddleware(req, res, next) {
    try {
      req.validated = { ...(req.validated || {}), query: validator(req.query) };
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Ensure an `:id` route parameter looks like a real id.
 * Malformed ids are a client mistake (400); unknown ids become 404 later.
 */
export function validateIdParam(paramName = 'id') {
  return function validateIdParamMiddleware(req, res, next) {
    const value = req.params[paramName];
    if (!isValidId(value)) {
      return next(AppError.badRequest('Invalid id format', [{ field: paramName, message: `"${value}" is not a valid id` }]));
    }
    req.validated = { ...(req.validated || {}), params: { [paramName]: value.trim() } };
    return next();
  };
}
