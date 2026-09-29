import { beforeEach, describe, expect, it } from 'vitest';
import { api, resetData, createTodoFixture, createNoteFixture } from './helpers/testContext.js';

/**
 * Cross-cutting API behaviour: health check, unknown routes and the shared
 * error response shape.
 */
describe('API infrastructure', () => {
  beforeEach(() => {
    resetData();
  });

  it('exposes a health check describing the in-memory store', async () => {
    await createTodoFixture({ title: 'One todo' });
    await createNoteFixture({ title: 'One note' });

    const response = await api.get('/api/health').expect(200);

    expect(response.body.data).toMatchObject({
      status: 'ok',
      storage: 'in-memory',
      counts: { todos: 1, notes: 1 },
    });
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const response = await api.get('/api/nope').expect(404);

    expect(response.body.error).toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
    expect(response.body.error.message).toContain('/api/nope');
  });

  it('returns 404 for a trailing route on a known resource', async () => {
    await api.get('/api/todos/1/2').expect(404);
  });

  it('uses the same error envelope for validation, not-found and unknown failures', async () => {
    const validation = await api.post('/api/todos').send({}).expect(400);
    const missing = await api.get('/api/todos/00000000-0000-4000-8000-000000000000').expect(404);

    [validation.body.error, missing.body.error].forEach((error) => {
      expect(Object.keys(error).sort()).toEqual(['code', 'details', 'message', 'status']);
      expect(Array.isArray(error.details)).toBe(true);
    });
  });
});
