import { createSeedNotes, createSeedTodos } from './seed.js';

/**
 * The in-memory database.
 *
 * This module owns the ONLY mutable data in the application. It is intentionally
 * tiny: a couple of arrays behind a few functions. Repositories read and write
 * through here, so replacing this file with a MongoDB/PostgreSQL connection is
 * the single place that needs to change.
 *
 * Data lives for as long as the Node process lives. Restart the server and the
 * store starts over.
 */
const store = {
  todos: [],
  notes: [],
};

/** Direct access to the raw collections (repositories are the public API). */
export function getStore() {
  return store;
}

/**
 * Empties every collection.
 * With `{ seed: true }` the demo data from `seed.js` is loaded instead.
 */
export function resetStore({ seed = false } = {}) {
  store.todos = seed ? createSeedTodos() : [];
  store.notes = seed ? createSeedNotes() : [];
  return store;
}

/** Number of records currently held in a collection ("todos" | "notes"). */
export function collectionSize(collectionName) {
  const collection = store[collectionName];
  if (!Array.isArray(collection)) {
    throw new Error(`Unknown collection: ${collectionName}`);
  }
  return collection.length;
}
