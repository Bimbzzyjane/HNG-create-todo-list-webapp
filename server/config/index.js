/**
 * Central application configuration.
 *
 * Every environment-dependent value is read here so the rest of the server never
 * touches `process.env` directly. This keeps the app easy to configure and easy
 * to test (tests can rely on NODE_ENV being "test").
 */

/** Convert a string environment value into a boolean. */
function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

export const config = {
  /** "development" | "test" | "production" */
  env: process.env.NODE_ENV || 'development',
  /** Port the Express server listens on. */
  port: Number(process.env.PORT || 5000),
  /** Optional comma separated list of allowed browser origins (CORS). */
  clientOrigin: process.env.CLIENT_ORIGIN || '',
  /** Seed the in-memory store with demo todos/notes on boot. */
  seedData: parseBoolean(process.env.SEED_DATA, true),
  /** Maximum accepted JSON body size. */
  jsonLimit: process.env.JSON_LIMIT || '100kb',
};

/** True while the automated test suite is running. */
export const isTest = config.env === 'test';
