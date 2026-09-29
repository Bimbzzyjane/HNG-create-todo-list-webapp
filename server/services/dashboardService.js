import * as todoRepository from '../data/todoRepository.js';
import * as noteRepository from '../data/noteRepository.js';
import { nowIso } from '../utils/clock.js';
import { isDueToday, isOverdue } from '../utils/dates.js';

/**
 * Dashboard service - aggregates read-only statistics for the overview page.
 *
 * It talks to repositories directly (instead of the todo/note services) because
 * it only needs raw collections, and it never mutates anything.
 */

/** Todos that are not finished and whose due date sits before today. */
function countOverdue(todos) {
  return todos.filter((todo) => !todo.completed && isOverdue(todo.due_date)).length;
}

/** Todos that are not finished and are due today. */
function countDueToday(todos) {
  return todos.filter((todo) => !todo.completed && isDueToday(todo.due_date)).length;
}

function buildPriorityBreakdown(todos) {
  return todos.reduce(
    (breakdown, todo) => {
      breakdown[todo.priority] = (breakdown[todo.priority] ?? 0) + 1;
      return breakdown;
    },
    { low: 0, medium: 0, high: 0 },
  );
}

/** Statistics payload consumed by GET /api/dashboard/stats. */
export async function getDashboardStats() {
  const [todos, notes] = await Promise.all([todoRepository.findAll(), noteRepository.findAll()]);

  const completed = todos.filter((todo) => todo.completed).length;
  const pending = todos.length - completed;
  const highPriority = todos.filter((todo) => todo.priority === 'high');

  return {
    todos: {
      total: todos.length,
      pending,
      completed,
      highPriority: highPriority.length,
      highPriorityPending: highPriority.filter((todo) => !todo.completed).length,
      overdue: countOverdue(todos),
      dueToday: countDueToday(todos),
      completionRate: todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100),
    },
    notes: {
      total: notes.length,
    },
    priorityBreakdown: buildPriorityBreakdown(todos),
    recentTodos: [...todos].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    recentNotes: [...notes].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 3),
    generated_at: nowIso(),
  };
}
