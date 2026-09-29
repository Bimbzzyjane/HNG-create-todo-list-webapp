import { beforeEach, describe, expect, it } from 'vitest';
import { api, resetData, createTodoFixture, createNoteFixture } from './helpers/testContext.js';

/** Calendar day helper so the fixtures do not depend on a fixed clock. */
function dayFromToday(offsetDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

/**
 * Dashboard statistics tests (GET /api/dashboard/stats).
 */
describe('Dashboard API', () => {
  beforeEach(() => {
    resetData();
  });

  it('returns zeroed statistics for an empty store', async () => {
    const response = await api.get('/api/dashboard/stats').expect(200);

    expect(response.body.data.todos).toEqual({
      total: 0,
      pending: 0,
      completed: 0,
      highPriority: 0,
      highPriorityPending: 0,
      overdue: 0,
      dueToday: 0,
      completionRate: 0,
    });
    expect(response.body.data.notes).toEqual({ total: 0 });
    expect(response.body.data.priorityBreakdown).toEqual({ low: 0, medium: 0, high: 0 });
    expect(response.body.data.recentTodos).toEqual([]);
    expect(response.body.data.recentNotes).toEqual([]);
    expect(typeof response.body.data.generated_at).toBe('string');
  });

  it('counts todos by status and priority', async () => {
    await createTodoFixture({ title: 'High pending', priority: 'high' });
    await createTodoFixture({ title: 'Medium pending', priority: 'medium' });
    await createTodoFixture({ title: 'Low done', priority: 'low', completed: true });
    await createTodoFixture({ title: 'High done', priority: 'high', completed: true });

    const response = await api.get('/api/dashboard/stats').expect(200);

    expect(response.body.data.todos).toMatchObject({
      total: 4,
      pending: 2,
      completed: 2,
      highPriority: 2,
      highPriorityPending: 1,
      completionRate: 50,
    });
    expect(response.body.data.priorityBreakdown).toEqual({ low: 1, medium: 1, high: 2 });
  });

  it('reports overdue and due-today todos without counting completed ones', async () => {
    await createTodoFixture({ title: 'Overdue', due_date: dayFromToday(-3) });
    await createTodoFixture({ title: 'Due today', due_date: dayFromToday(0) });
    await createTodoFixture({ title: 'Later', due_date: dayFromToday(5) });
    await createTodoFixture({ title: 'Finished late', due_date: dayFromToday(-10), completed: true });

    const response = await api.get('/api/dashboard/stats').expect(200);

    expect(response.body.data.todos.overdue).toBe(1);
    expect(response.body.data.todos.dueToday).toBe(1);
  });

  it('counts notes and returns the newest ones first', async () => {
    await createNoteFixture({ title: 'First note' });
    await createNoteFixture({ title: 'Second note' });
    await createNoteFixture({ title: 'Third note' });
    await createNoteFixture({ title: 'Fourth note' });

    const response = await api.get('/api/dashboard/stats').expect(200);
    const { recentNotes } = response.body.data;

    expect(response.body.data.notes.total).toBe(4);
    expect(recentNotes).toHaveLength(3);
    expect(recentNotes[0].title).toBe('Fourth note');
  });

  it('limits recent todos to five, newest first', async () => {
    for (let index = 1; index <= 6; index += 1) {
      await createTodoFixture({ title: `Todo ${index}` });
    }

    const response = await api.get('/api/dashboard/stats').expect(200);
    const { recentTodos } = response.body.data;

    expect(recentTodos).toHaveLength(5);
    expect(recentTodos.map((todo) => todo.title)).toEqual([
      'Todo 6',
      'Todo 5',
      'Todo 4',
      'Todo 3',
      'Todo 2',
    ]);
  });

  it('rounds the completion rate to a whole percentage', async () => {
    await createTodoFixture({ title: 'One', completed: true });
    await createTodoFixture({ title: 'Two' });
    await createTodoFixture({ title: 'Three' });

    const response = await api.get('/api/dashboard/stats').expect(200);
    expect(response.body.data.todos.completionRate).toBe(33);
  });

  it('reflects changes made through the todo endpoints', async () => {
    const created = await createTodoFixture({ title: 'Track me', priority: 'high' });

    const afterCreate = await api.get('/api/dashboard/stats').expect(200);
    expect(afterCreate.body.data.todos).toMatchObject({ total: 1, pending: 1, completed: 0 });

    await api.patch(`/api/todos/${created.id}`).send({ completed: true }).expect(200);

    const afterComplete = await api.get('/api/dashboard/stats').expect(200);
    expect(afterComplete.body.data.todos).toMatchObject({
      total: 1,
      pending: 0,
      completed: 1,
      completionRate: 100,
    });

    await api.delete(`/api/todos/${created.id}`).expect(200);

    const afterDelete = await api.get('/api/dashboard/stats').expect(200);
    expect(afterDelete.body.data.todos.total).toBe(0);
  });
});
