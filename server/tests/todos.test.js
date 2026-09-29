import { beforeEach, describe, expect, it } from 'vitest';
import {
  api,
  resetData,
  createTodoFixture,
  UNKNOWN_ID,
  MALFORMED_ID,
} from './helpers/testContext.js';

/**
 * Todo API tests.
 * Covers CRUD, validation, 404s, search, filtering, sorting and metadata.
 */
describe('Todo API', () => {
  beforeEach(() => {
    resetData();
  });

  describe('GET /api/todos', () => {
    it('returns an empty collection with metadata for an empty store', async () => {
      const response = await api.get('/api/todos').expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.meta).toEqual({
        count: 0,
        total: 0,
        counts: { all: 0, pending: 0, completed: 0, low: 0, medium: 0, high: 0 },
        filters: { search: '', status: 'all', priority: 'all', sort: 'created_at', order: 'desc' },
      });
    });

    it('returns every todo with the documented fields', async () => {
      await createTodoFixture({ title: 'First' });
      await createTodoFixture({ title: 'Second' });

      const response = await api.get('/api/todos').expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.count).toBe(2);
      expect(response.body.meta.total).toBe(2);
      expect(Object.keys(response.body.data[0]).sort()).toEqual(
        ['updated_at', 'due_date', 'id', 'priority', 'title', 'description', 'completed', 'created_at'].sort(),
      );
    });

    it('orders the newest todo first by default', async () => {
      await createTodoFixture({ title: 'Older' });
      await createTodoFixture({ title: 'Newer' });

      const response = await api.get('/api/todos').expect(200);

      expect(response.body.data.map((todo) => todo.title)).toEqual(['Newer', 'Older']);
    });

    it('returns 400 for an unknown status filter', async () => {
      const response = await api.get('/api/todos?status=archived').expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toContainEqual({
        field: 'status',
        message: 'Status must be one of: all, pending, completed',
      });
    });

    it('returns 400 for an unknown priority filter', async () => {
      const response = await api.get('/api/todos?priority=urgent').expect(400);

      expect(response.body.error.details[0].field).toBe('priority');
    });

    it('returns 400 for an unsupported sort field or order', async () => {
      const sortResponse = await api.get('/api/todos?sort=colour').expect(400);
      expect(sortResponse.body.error.details[0].field).toBe('sort');

      const orderResponse = await api.get('/api/todos?order=sideways').expect(400);
      expect(orderResponse.body.error.details[0].field).toBe('order');
    });
  });

  describe('POST /api/todos', () => {
    it('creates a todo with defaults and a server generated id', async () => {
      const response = await api.post('/api/todos').send({ title: 'Write the plan' }).expect(201);

      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.data).toMatchObject({
        title: 'Write the plan',
        description: '',
        completed: false,
        priority: 'medium',
        due_date: null,
      });
      expect(response.body.data.id).toMatch(/^[0-9a-f-]{36}$/i);
      expect(response.body.data.created_at).toBe(response.body.data.updated_at);
    });

    it('stores every provided field and normalises values', async () => {
      const response = await api
        .post('/api/todos')
        .send({
          title: '  Trim me  ',
          description: '  With a description  ',
          completed: true,
          priority: 'High',
          due_date: '2030-04-01',
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        title: 'Trim me',
        description: 'With a description',
        completed: true,
        priority: 'high',
      });
      expect(new Date(response.body.data.due_date).toISOString()).toBe(response.body.data.due_date);
    });

    it('persists the todo so it can be read back', async () => {
      const created = await createTodoFixture({ title: 'Persisted' });

      const response = await api.get(`/api/todos/${created.id}`).expect(200);
      expect(response.body.data).toEqual(created);
    });

    it('rejects a missing, blank or non-string title', async () => {
      const missing = await api.post('/api/todos').send({}).expect(400);
      expect(missing.body.error.details).toContainEqual({
        field: 'title',
        message: 'Title is required',
      });

      const blank = await api.post('/api/todos').send({ title: '   ' }).expect(400);
      expect(blank.body.error.details[0].message).toBe('Title cannot be empty');

      const wrongType = await api.post('/api/todos').send({ title: 42 }).expect(400);
      expect(wrongType.body.error.details[0].message).toBe('Title must be a string');
    });

    it('rejects an invalid priority', async () => {
      const response = await api
        .post('/api/todos')
        .send({ title: 'Bad priority', priority: 'urgent' })
        .expect(400);

      expect(response.body.error.message).toBe('Todo payload is invalid');
      expect(response.body.error.details[0].field).toBe('priority');
    });

    it('rejects an invalid due date', async () => {
      const response = await api
        .post('/api/todos')
        .send({ title: 'Bad date', due_date: 'next tuesday' })
        .expect(400);

      expect(response.body.error.details[0].field).toBe('due_date');
    });

    it('rejects a non-boolean completed value', async () => {
      const response = await api
        .post('/api/todos')
        .send({ title: 'Bad flag', completed: 'yes' })
        .expect(400);

      expect(response.body.error.details[0].field).toBe('completed');
    });

    it('rejects server owned fields such as id', async () => {
      const response = await api
        .post('/api/todos')
        .send({ id: UNKNOWN_ID, title: 'Sneaky id' })
        .expect(400);

      expect(response.body.error.details[0].field).toBe('id');
    });

    it('reports every invalid field at once', async () => {
      const response = await api
        .post('/api/todos')
        .send({ title: '', priority: 'nope', due_date: 'nope', completed: 1 })
        .expect(400);

      expect(response.body.error.details.map((detail) => detail.field).sort()).toEqual([
        'completed',
        'due_date',
        'priority',
        'title',
      ]);
    });

    it('returns 400 with a helpful code for malformed JSON', async () => {
      const response = await api
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('{ "title": "broken" ')
        .expect(400);

      expect(response.body.error.code).toBe('MALFORMED_JSON');
    });
  });

  describe('GET /api/todos/:id', () => {
    it('returns 404 for a well formed but unknown id', async () => {
      const response = await api.get(`/api/todos/${UNKNOWN_ID}`).expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toContain(UNKNOWN_ID);
    });

    it('returns 400 for a malformed id', async () => {
      const response = await api.get(`/api/todos/${MALFORMED_ID}`).expect(400);

      expect(response.body.error.details[0].field).toBe('id');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('replaces the todo and applies defaults for omitted optional fields', async () => {
      const created = await createTodoFixture({
        title: 'Before',
        description: 'Old description',
        priority: 'high',
        due_date: '2030-01-01',
        completed: true,
      });

      const response = await api
        .put(`/api/todos/${created.id}`)
        .send({ title: 'After' })
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: created.id,
        title: 'After',
        description: '',
        priority: 'medium',
        due_date: null,
        completed: false,
        created_at: created.created_at,
      });
      expect(response.body.data.updated_at >= created.updated_at).toBe(true);
    });

    it('validates the payload and returns 400', async () => {
      const created = await createTodoFixture();

      const response = await api.put(`/api/todos/${created.id}`).send({ title: '' }).expect(400);

      expect(response.body.error.details[0].field).toBe('title');
    });

    it('returns 404 when the todo does not exist', async () => {
      await api.put(`/api/todos/${UNKNOWN_ID}`).send({ title: 'Ghost' }).expect(404);
    });
  });

  describe('PATCH /api/todos/:id', () => {
    it('marks a todo as completed and back again', async () => {
      const created = await createTodoFixture({ title: 'Toggle me' });

      const completed = await api
        .patch(`/api/todos/${created.id}`)
        .send({ completed: true })
        .expect(200);

      expect(completed.body.data.completed).toBe(true);
      expect(completed.body.data.title).toBe('Toggle me');

      const reverted = await api
        .patch(`/api/todos/${created.id}`)
        .send({ completed: false })
        .expect(200);

      expect(reverted.body.data.completed).toBe(false);
    });

    it('keeps untouched fields intact when updating one field', async () => {
      const created = await createTodoFixture({
        title: 'Original title',
        description: 'Keep me',
        priority: 'low',
        due_date: '2030-06-15',
      });

      const response = await api
        .patch(`/api/todos/${created.id}`)
        .send({ title: 'New title' })
        .expect(200);

      expect(response.body.data).toMatchObject({
        title: 'New title',
        description: 'Keep me',
        priority: 'low',
        due_date: created.due_date,
      });
    });

    it('rejects an empty update and invalid values', async () => {
      const created = await createTodoFixture();

      const empty = await api.patch(`/api/todos/${created.id}`).send({}).expect(400);
      expect(empty.body.error.details[0].field).toBe('body');

      const invalid = await api
        .patch(`/api/todos/${created.id}`)
        .send({ completed: 'yes' })
        .expect(400);
      expect(invalid.body.error.details[0].field).toBe('completed');
    });

    it('returns 404 when the todo does not exist', async () => {
      await api.patch(`/api/todos/${UNKNOWN_ID}`).send({ completed: true }).expect(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('deletes the todo and returns the removed record', async () => {
      const created = await createTodoFixture({ title: 'Delete me' });

      const response = await api.delete(`/api/todos/${created.id}`).expect(200);
      expect(response.body.data).toEqual(created);

      await api.get(`/api/todos/${created.id}`).expect(404);
      const list = await api.get('/api/todos').expect(200);
      expect(list.body.data).toHaveLength(0);
    });

    it('returns 404 when deleting the same todo twice', async () => {
      const created = await createTodoFixture();
      await api.delete(`/api/todos/${created.id}`).expect(200);

      await api.delete(`/api/todos/${created.id}`).expect(404);
    });
  });

  describe('DELETE /api/todos/completed', () => {
    it('removes only completed todos', async () => {
      await createTodoFixture({ title: 'Done one', completed: true });
      await createTodoFixture({ title: 'Done two', completed: true });
      await createTodoFixture({ title: 'Still pending' });

      const response = await api.delete('/api/todos/completed').expect(200);
      expect(response.body.data.deletedCount).toBe(2);

      const list = await api.get('/api/todos').expect(200);
      expect(list.body.data.map((todo) => todo.title)).toEqual(['Still pending']);
    });

    it('reports zero when nothing is completed', async () => {
      await createTodoFixture({ title: 'Pending' });

      const response = await api.delete('/api/todos/completed').expect(200);
      expect(response.body.data.deletedCount).toBe(0);
    });
  });

  describe('search and filtering', () => {
    beforeEach(async () => {
      await createTodoFixture({
        title: 'Ship the API',
        description: 'Add Supertest coverage',
        priority: 'high',
      });
      await createTodoFixture({
        title: 'Write documentation',
        description: 'Explain the API endpoints',
        priority: 'low',
        completed: true,
      });
      await createTodoFixture({
        title: 'Buy groceries',
        description: 'Milk and bread',
        priority: 'medium',
      });
    });

    it('searches titles case-insensitively', async () => {
      const response = await api.get('/api/todos?search=SHIP').expect(200);

      expect(response.body.data.map((todo) => todo.title)).toEqual(['Ship the API']);
    });

    it('matches a search term found in either the title or the description', async () => {
      const response = await api.get('/api/todos?search=api').expect(200);

      expect(response.body.data.map((todo) => todo.title).sort()).toEqual([
        'Ship the API',
        'Write documentation',
      ]);
    });

    it('searches descriptions as well as titles', async () => {
      const response = await api.get('/api/todos?search=bread').expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Buy groceries');
    });

    it('returns an empty list when nothing matches', async () => {
      const response = await api.get('/api/todos?search=zzzz').expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.meta.count).toBe(0);
      expect(response.body.meta.total).toBe(3);
    });

    it('filters pending and completed todos', async () => {
      const pending = await api.get('/api/todos?status=pending').expect(200);
      expect(pending.body.data.map((todo) => todo.title).sort()).toEqual([
        'Buy groceries',
        'Ship the API',
      ]);

      const completed = await api.get('/api/todos?status=completed').expect(200);
      expect(completed.body.data.map((todo) => todo.title)).toEqual(['Write documentation']);
    });

    it('filters by priority', async () => {
      const high = await api.get('/api/todos?priority=high').expect(200);
      expect(high.body.data.map((todo) => todo.title)).toEqual(['Ship the API']);

      const low = await api.get('/api/todos?priority=low').expect(200);
      expect(low.body.data).toHaveLength(1);
    });

    it('combines search, status and priority filters', async () => {
      const response = await api
        .get('/api/todos?search=api&status=pending&priority=high')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Ship the API');

      const none = await api.get('/api/todos?search=api&status=completed&priority=high').expect(200);
      expect(none.body.data).toEqual([]);
    });

    it('reports collection wide counts in the metadata', async () => {
      const response = await api.get('/api/todos?status=completed').expect(200);

      expect(response.body.meta).toMatchObject({
        count: 1,
        total: 3,
        counts: { all: 3, pending: 2, completed: 1, low: 1, medium: 1, high: 1 },
      });
    });

    it('sorts by priority and title in both directions', async () => {
      const byPriority = await api.get('/api/todos?sort=priority&order=desc').expect(200);
      expect(byPriority.body.data.map((todo) => todo.priority)).toEqual(['high', 'medium', 'low']);

      const byTitle = await api.get('/api/todos?sort=title&order=asc').expect(200);
      expect(byTitle.body.data.map((todo) => todo.title)).toEqual([
        'Buy groceries',
        'Ship the API',
        'Write documentation',
      ]);
    });

    it('sorts by due date with undated todos last', async () => {
      const dueSoon = await createTodoFixture({ title: 'Due soon', due_date: '2031-01-01' });
      const dueLater = await createTodoFixture({ title: 'Due later', due_date: '2031-06-01' });
      await createTodoFixture({ title: 'No due date' });

      const response = await api.get('/api/todos?sort=due_date&order=asc').expect(200);
      const titles = response.body.data.map((todo) => todo.title);

      expect(titles.indexOf(dueSoon.title)).toBeLessThan(titles.indexOf(dueLater.title));
      expect(titles[titles.length - 1]).toBe('No due date');
    });
  });
});
