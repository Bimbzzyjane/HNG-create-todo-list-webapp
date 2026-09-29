import request from 'supertest';
import { createApp } from '../../app.js';
import { resetStore } from '../../data/memoryStore.js';
import { resetClock } from '../../utils/clock.js';

/**
 * Shared test helpers.
 *
 * `resetData()` is called from `beforeEach` in every test file, so each test
 * starts from a known state and never depends on the order it runs in.
 */

export const app = createApp();
export const api = request(app);

/** Empty the store and restart the timestamp clock. `{ seed: true }` loads demo data. */
export function resetData({ seed = false } = {}) {
  resetClock();
  return resetStore({ seed });
}

/** Creates a todo through the API and returns the stored record. */
export async function createTodoFixture(overrides = {}) {
  const response = await api
    .post('/api/todos')
    .send({ title: 'Fixture todo', ...overrides })
    .expect(201);

  return response.body.data;
}

/** Creates a note through the API and returns the stored record. */
export async function createNoteFixture(overrides = {}) {
  const response = await api
    .post('/api/notes')
    .send({ title: 'Fixture note', content: 'Fixture content', ...overrides })
    .expect(201);

  return response.body.data;
}

/** An id that is a valid UUID but is guaranteed not to exist in the store. */
export const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

/** A string that is not a valid id at all. */
export const MALFORMED_ID = 'not-a-real-id';
