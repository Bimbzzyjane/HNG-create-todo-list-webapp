import * as todoRepository from '../data/todoRepository.js';
import { AppError } from '../utils/AppError.js';
import { PRIORITY_WEIGHT } from '../utils/priority.js';
import { matchesSearch } from '../utils/text.js';
import { DEFAULT_TODO_QUERY } from '../validators/todoValidator.js';

/**
 * Todo service - all todo business rules live here.
 *
 * Controllers only move data in and out of HTTP; repositories only store it.
 * Anything that needs a decision (what "pending" means, how search works, what
 * the list metadata contains) belongs in this file.
 */

/** Search matches the title or the description, case-insensitively. */
function matchesTodo(todo, search) {
  return matchesSearch(todo.title, search) || matchesSearch(todo.description, search);
}

/** Applies the status / priority / search filters. */
function filterTodos(todos, { search = '', status = 'all', priority = 'all' } = {}) {
  return todos.filter((todo) => {
    if (status === 'pending' && todo.completed) return false;
    if (status === 'completed' && !todo.completed) return false;
    if (priority !== 'all' && todo.priority !== priority) return false;
    if (search && !matchesTodo(todo, search)) return false;
    return true;
  });
}

/** Comparison helpers for each sortable field. */
const COMPARATORS = {
  created_at: (a, b) => a.created_at.localeCompare(b.created_at),
  updated_at: (a, b) => a.updated_at.localeCompare(b.updated_at),
  title: (a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }),
  priority: (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
  // Todos without a due date always sort last, whatever the direction.
  due_date: (a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  },
};

/** Sorts a copy of the list. `order` is either "asc" or "desc". */
function sortTodos(todos, sort = 'created_at', order = 'desc') {
  const comparator = COMPARATORS[sort] ?? COMPARATORS.created_at;
  const direction = order === 'asc' ? 1 : -1;
  return [...todos].sort((a, b) => {
    const result = comparator(a, b);
    if (result !== 0) return result * direction;
    // Stable tie-breaker so identical values keep a predictable order.
    return a.created_at.localeCompare(b.created_at) * direction;
  });
}

/** Counts used by the filter chips in the UI. */
function buildCounts(todos) {
  return todos.reduce(
    (counts, todo) => {
      counts.all += 1;
      counts[todo.completed ? 'completed' : 'pending'] += 1;
      counts[todo.priority] += 1;
      return counts;
    },
    { all: 0, pending: 0, completed: 0, low: 0, medium: 0, high: 0 },
  );
}

/** List response: the filtered todos plus metadata about the collection. */
export async function listTodos(filters = {}) {
  const query = { ...DEFAULT_TODO_QUERY, ...filters };
  const allTodos = await todoRepository.findAll();
  const items = sortTodos(filterTodos(allTodos, query), query.sort, query.order);

  return {
    items,
    meta: {
      count: items.length,
      total: allTodos.length,
      counts: buildCounts(allTodos),
      filters: query,
    },
  };
}

/** A single todo, or a 404 AppError when it does not exist. */
export async function getTodoById(id) {
  const todo = await todoRepository.findById(id);
  if (!todo) {
    throw AppError.notFound(`Todo with id "${id}" was not found`);
  }
  return todo;
}

/** Creates a todo from an already validated payload. */
export async function createTodo(payload) {
  return todoRepository.create(payload);
}

/** PUT semantics: replace the todo, applying defaults for omitted fields. */
export async function replaceTodo(id, payload) {
  await getTodoById(id);
  return todoRepository.update(id, payload);
}

/** PATCH semantics: merge the supplied changes into the todo. */
export async function updateTodo(id, changes) {
  await getTodoById(id);
  return todoRepository.update(id, changes);
}

/** Deletes a todo and returns the removed record. */
export async function deleteTodo(id) {
  const deleted = await todoRepository.remove(id);
  if (!deleted) {
    throw AppError.notFound(`Todo with id "${id}" was not found`);
  }
  return deleted;
}

/** Removes every completed todo. Returns how many were deleted. */
export async function clearCompletedTodos() {
  const deleted = await todoRepository.removeWhere((todo) => todo.completed);
  return { deletedCount: deleted.length };
}
