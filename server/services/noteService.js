import * as noteRepository from '../data/noteRepository.js';
import { AppError } from '../utils/AppError.js';
import { matchesSearch } from '../utils/text.js';

/**
 * Note service - all note business rules live here, mirroring the todo service.
 */

/** Newest updates first: that is how the notes board is presented. */
function sortNotes(notes) {
  return [...notes].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

/** Search matches the note title or its content. */
function filterNotes(notes, search = '') {
  if (!search) return notes;
  return notes.filter((note) => matchesSearch(note.title, search) || matchesSearch(note.content, search));
}

/** List response: matching notes plus collection metadata. */
export async function listNotes(filters = {}) {
  const { search = '' } = filters;
  const allNotes = await noteRepository.findAll();
  const items = sortNotes(filterNotes(allNotes, search));

  return {
    items,
    meta: {
      count: items.length,
      total: allNotes.length,
      filters: { search },
    },
  };
}

/** A single note, or a 404 AppError when it does not exist. */
export async function getNoteById(id) {
  const note = await noteRepository.findById(id);
  if (!note) {
    throw AppError.notFound(`Note with id "${id}" was not found`);
  }
  return note;
}

/** Creates a note from an already validated payload. */
export async function createNote(payload) {
  return noteRepository.create(payload);
}

/** PUT semantics: replace the note, applying defaults for omitted fields. */
export async function replaceNote(id, payload) {
  await getNoteById(id);
  return noteRepository.update(id, payload);
}

/** PATCH semantics: merge the supplied changes into the note. */
export async function updateNote(id, changes) {
  await getNoteById(id);
  return noteRepository.update(id, changes);
}

/** Deletes a note and returns the removed record. */
export async function deleteNote(id) {
  const deleted = await noteRepository.remove(id);
  if (!deleted) {
    throw AppError.notFound(`Note with id "${id}" was not found`);
  }
  return deleted;
}
