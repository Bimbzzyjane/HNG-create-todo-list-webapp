import app from './app.js';
import { config } from './config/index.js';
import { resetStore } from './data/memoryStore.js';

/**
 * Serverless entry point used by Vercel (see `vercel.json`).
 *
 * Locally the API is a long-running Node process started by `server.js`, which
 * calls `app.listen`. On Vercel it runs as a Function, so this module exports
 * the already-built Express app instead and lets the platform handle listening.
 *
 * Both entry points reuse `createApp()` from `app.js`, so routes, validation,
 * error handling and the API contract stay identical in every environment.
 *
 * The in-memory store is seeded once per function instance, which is why data on
 * Vercel is ephemeral - see "Deploying to Vercel" in the README.
 */
resetStore({ seed: config.seedData });

export default app;
