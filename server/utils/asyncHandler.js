/**
 * Wraps an async route handler so rejected promises reach the error middleware.
 * (Express 5 already forwards rejections, but being explicit keeps the intent
 * clear and keeps the code working if a route is ever wrapped manually.)
 */
export function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
