import { getStore } from './memoryStore.js';
import { generateId } from '../utils/idGenerator.js';
import { nowIso } from '../utils/clock.js';

/**
 * Note repository - the data access layer for notes.
 * Mirrors `todoRepository.js`: async functions, cloned results, server-owned ids.
 */

const WRITABLE_FIELDS = ['title', 'content'];

const clone = (record) => (record ? structuredClone(record) : null);

function pickWritableFields(payload = {}) {
  return WRITABLE_FIELDS.reduce((fields, key) => {
    if (payload[key] !== undefined) fields[key] = payload[key];
    return fields;
  }, {});
}

/** All notes, in insertion order. */
export async function findAll() {
  return getStore().notes.map(clone);
}

/** A single note by id, or null when it does not exist. */
export async function findById(id) {
  return clone(getStore().notes.find((note) => note.id === id));
}

/** Insert a new note and return the stored record. */
export async function create(payload) {
  const timestamp = nowIso();
  const note = {
    id: generateId(),
    ...pickWritableFields(payload),
    created_at: timestamp,
    updated_at: timestamp,
  };

  getStore().notes.push(note);
  return clone(note);
}

/** Apply a partial update, or return null when the note is missing. */
export async function update(id, payload) {
  const store = getStore();
  const index = store.notes.findIndex((note) => note.id === id);
  if (index === -1) return null;

  const current = store.notes[index];
  const updated = {
    ...current,
    ...pickWritableFields(payload),
    id: current.id,
    created_at: current.created_at,
    updated_at: nowIso(),
  };

  store.notes[index] = updated;
  return clone(updated);
}

/** Delete one note. Returns the deleted record, or null when it is missing. */
export async function remove(id) {
  const store = getStore();
  const index = store.notes.findIndex((note) => note.id === id);
  if (index === -1) return null;

  const [deleted] = store.notes.splice(index, 1);
  return clone(deleted);
}

/** Total number of notes in the store. */
export async function count() {
  return getStore().notes.length;
}
