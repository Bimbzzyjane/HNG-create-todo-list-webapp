import { getStore } from './memoryStore.js';
import { generateId } from '../utils/idGenerator.js';
import { nowIso } from '../utils/clock.js';

/**
 * Todo repository - the data access layer for todos.
 *
 * Every function is `async` and returns plain cloned objects. That is deliberate:
 * the services above it already behave like they are talking to a remote data
 * source, so replacing this module with a MongoDB or PostgreSQL implementation
 * will not change a single line in the services, controllers or routes.
 */

/** Fields a client is allowed to write. IDs and timestamps are server-owned. */
const WRITABLE_FIELDS = ['title', 'description', 'priority', 'due_date', 'completed'];

const clone = (record) => (record ? structuredClone(record) : null);

/** Copies only writable, defined fields from a payload. */
function pickWritableFields(payload = {}) {
  return WRITABLE_FIELDS.reduce((fields, key) => {
    if (payload[key] !== undefined) fields[key] = payload[key];
    return fields;
  }, {});
}

/** All todos, in insertion order. */
export async function findAll() {
  return getStore().todos.map(clone);
}

/** A single todo by id, or null when it does not exist. */
export async function findById(id) {
  return clone(getStore().todos.find((todo) => todo.id === id));
}

/** Insert a new todo and return the stored record. */
export async function create(payload) {
  const timestamp = nowIso();
  const todo = {
    id: generateId(),
    ...pickWritableFields(payload),
    created_at: timestamp,
    updated_at: timestamp,
  };

  getStore().todos.push(todo);
  return clone(todo);
}

/** Apply a partial update, or return null when the todo is missing. */
export async function update(id, payload) {
  const store = getStore();
  const index = store.todos.findIndex((todo) => todo.id === id);
  if (index === -1) return null;

  const current = store.todos[index];
  const updated = {
    ...current,
    ...pickWritableFields(payload),
    id: current.id,
    created_at: current.created_at,
    updated_at: nowIso(),
  };

  store.todos[index] = updated;
  return clone(updated);
}

/** Delete one todo. Returns the deleted record, or null when it is missing. */
export async function remove(id) {
  const store = getStore();
  const index = store.todos.findIndex((todo) => todo.id === id);
  if (index === -1) return null;

  const [deleted] = store.todos.splice(index, 1);
  return clone(deleted);
}

/** Delete every todo matching a predicate. Returns the deleted records. */
export async function removeWhere(predicate) {
  const store = getStore();
  const deleted = store.todos.filter(predicate);
  store.todos = store.todos.filter((todo) => !predicate(todo));
  return deleted.map(clone);
}

/** Total number of todos in the store. */
export async function count() {
  return getStore().todos.length;
}
