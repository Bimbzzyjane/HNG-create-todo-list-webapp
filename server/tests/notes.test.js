import { beforeEach, describe, expect, it } from 'vitest';
import {
  api,
  resetData,
  createNoteFixture,
  UNKNOWN_ID,
  MALFORMED_ID,
} from './helpers/testContext.js';

/**
 * Note API tests: CRUD, validation, 404s and search.
 */
describe('Note API', () => {
  beforeEach(() => {
    resetData();
  });

  describe('GET /api/notes', () => {
    it('returns an empty collection with metadata for an empty store', async () => {
      const response = await api.get('/api/notes').expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.meta).toEqual({ count: 0, total: 0, filters: { search: '' } });
    });

    it('returns notes with the documented fields, newest update first', async () => {
      await createNoteFixture({ title: 'Older note' });
      await createNoteFixture({ title: 'Newer note' });

      const response = await api.get('/api/notes').expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((note) => note.title)).toEqual(['Newer note', 'Older note']);
      expect(Object.keys(response.body.data[0]).sort()).toEqual(
        ['id', 'title', 'content', 'created_at', 'updated_at'].sort(),
      );
    });

    it('returns 400 when search is not a single text value', async () => {
      const response = await api.get('/api/notes?search=a&search=b').expect(400);

      expect(response.body.error.details[0].field).toBe('search');
    });
  });

  describe('POST /api/notes', () => {
    it('creates a note with a server generated id and defaults', async () => {
      const response = await api.post('/api/notes').send({ title: 'Meeting notes' }).expect(201);

      expect(response.body.message).toBe('Note created successfully');
      expect(response.body.data).toMatchObject({ title: 'Meeting notes', content: '' });
      expect(response.body.data.id).toMatch(/^[0-9a-f-]{36}$/i);
      expect(response.body.data.created_at).toBe(response.body.data.updated_at);
    });

    it('trims the title and stores multi-line content', async () => {
      const response = await api
        .post('/api/notes')
        .send({ title: '  Checklist  ', content: '  First item\nSecond item  ' })
        .expect(201);

      expect(response.body.data.title).toBe('Checklist');
      expect(response.body.data.content).toBe('First item\nSecond item');
    });

    it('rejects a missing or blank title', async () => {
      const missing = await api.post('/api/notes').send({ content: 'No title' }).expect(400);
      expect(missing.body.error.details).toContainEqual({
        field: 'title',
        message: 'Title is required',
      });

      const blank = await api.post('/api/notes').send({ title: '   ' }).expect(400);
      expect(blank.body.error.details[0].message).toBe('Title cannot be empty');
    });

    it('rejects a title that is too long', async () => {
      const response = await api
        .post('/api/notes')
        .send({ title: 'x'.repeat(200) })
        .expect(400);

      expect(response.body.error.details[0].field).toBe('title');
    });

    it('rejects content that is too long', async () => {
      const response = await api
        .post('/api/notes')
        .send({ title: 'Long content', content: 'y'.repeat(6000) })
        .expect(400);

      expect(response.body.error.details[0].field).toBe('content');
    });

    it('rejects server owned fields', async () => {
      const response = await api
        .post('/api/notes')
        .send({ id: UNKNOWN_ID, title: 'Sneaky' })
        .expect(400);

      expect(response.body.error.details[0].field).toBe('id');
    });
  });

  describe('GET /api/notes/:id', () => {
    it('returns a single note', async () => {
      const created = await createNoteFixture({ title: 'Read me' });

      const response = await api.get(`/api/notes/${created.id}`).expect(200);
      expect(response.body.data).toEqual(created);
    });

    it('returns 404 for an unknown id and 400 for a malformed id', async () => {
      const missing = await api.get(`/api/notes/${UNKNOWN_ID}`).expect(404);
      expect(missing.body.error.code).toBe('NOT_FOUND');

      const malformed = await api.get(`/api/notes/${MALFORMED_ID}`).expect(400);
      expect(malformed.body.error.details[0].field).toBe('id');
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('replaces the note and returns the updated record', async () => {
      const created = await createNoteFixture({ title: 'Draft', content: 'Old body' });

      const response = await api
        .put(`/api/notes/${created.id}`)
        .send({ title: 'Final', content: 'New body' })
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: created.id,
        title: 'Final',
        content: 'New body',
        created_at: created.created_at,
      });
      expect(response.body.data.updated_at >= created.updated_at).toBe(true);
    });

    it('applies an empty content default when content is omitted', async () => {
      const created = await createNoteFixture({ content: 'Body to be cleared' });

      const response = await api
        .put(`/api/notes/${created.id}`)
        .send({ title: 'Title only' })
        .expect(200);

      expect(response.body.data.content).toBe('');
    });

    it('returns 400 for an invalid payload and 404 for a missing note', async () => {
      const created = await createNoteFixture();

      const invalid = await api.put(`/api/notes/${created.id}`).send({ title: '' }).expect(400);
      expect(invalid.body.error.details[0].field).toBe('title');

      await api.put(`/api/notes/${UNKNOWN_ID}`).send({ title: 'Ghost' }).expect(404);
    });
  });

  describe('PATCH /api/notes/:id', () => {
    it('updates only the supplied fields', async () => {
      const created = await createNoteFixture({ title: 'Keep title', content: 'Keep content' });

      const response = await api
        .patch(`/api/notes/${created.id}`)
        .send({ content: 'Updated content' })
        .expect(200);

      expect(response.body.data).toMatchObject({
        title: 'Keep title',
        content: 'Updated content',
      });
    });

    it('rejects an empty body and unknown ids', async () => {
      const created = await createNoteFixture();

      const empty = await api.patch(`/api/notes/${created.id}`).send({}).expect(400);
      expect(empty.body.error.details[0].field).toBe('body');

      await api.patch(`/api/notes/${UNKNOWN_ID}`).send({ title: 'Ghost' }).expect(404);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('deletes the note and removes it from the collection', async () => {
      const created = await createNoteFixture({ title: 'Remove me' });

      const response = await api.delete(`/api/notes/${created.id}`).expect(200);
      expect(response.body.data.id).toBe(created.id);

      const list = await api.get('/api/notes').expect(200);
      expect(list.body.data).toHaveLength(0);
      expect(list.body.meta.total).toBe(0);
    });

    it('returns 404 when the note does not exist', async () => {
      await api.delete(`/api/notes/${UNKNOWN_ID}`).expect(404);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await createNoteFixture({ title: 'Sprint planning', content: 'Scope the release' });
      await createNoteFixture({ title: 'Reading list', content: 'Books about testing' });
      await createNoteFixture({ title: 'Recipes', content: 'Banana bread' });
    });

    it('searches note titles', async () => {
      const response = await api.get('/api/notes?search=reading').expect(200);

      expect(response.body.data.map((note) => note.title)).toEqual(['Reading list']);
    });

    it('searches note content', async () => {
      const response = await api.get('/api/notes?search=bread').expect(200);

      expect(response.body.data.map((note) => note.title)).toEqual(['Recipes']);
    });

    it('returns metadata describing the filtered collection', async () => {
      const response = await api.get('/api/notes?search=zzz').expect(200);

      expect(response.body.meta).toEqual({ count: 0, total: 3, filters: { search: 'zzz' } });
    });
  });
});
