import { AppError } from '../utils/AppError.js';
import { trimString } from '../utils/text.js';
import {
  addError,
  throwIfInvalid,
  rejectServerOwnedFields,
  validateTitle,
  validateText,
  NOTE_TITLE_MAX_LENGTH,
  NOTE_CONTENT_MAX_LENGTH,
} from './fields.js';

/** Query defaults for GET /api/notes. */
export const DEFAULT_NOTE_QUERY = Object.freeze({ search: '' });

function ensurePlainObject(body) {
  if (body === undefined || body === null) return {};
  if (typeof body !== 'object' || Array.isArray(body)) {
    throw AppError.badRequest('Request body must be a JSON object');
  }
  return body;
}

/**
 * Validates the body of POST /api/notes and PUT /api/notes/:id.
 * Returns a complete, normalised note (content defaults to an empty string).
 */
export function validateCreateNote(body) {
  const payload = ensurePlainObject(body);
  const errors = [];
  rejectServerOwnedFields(payload, errors);

  const note = {
    title: validateTitle(payload.title, errors, { maxLength: NOTE_TITLE_MAX_LENGTH }),
    content: validateText(payload.content, errors, {
      field: 'content',
      label: 'Content',
      maxLength: NOTE_CONTENT_MAX_LENGTH,
    }),
  };

  throwIfInvalid(errors, 'Note payload is invalid');
  return note;
}

/**
 * Validates a partial note update (used by PATCH /api/notes/:id when enabled).
 * Only supplied fields are returned so existing content is preserved.
 */
export function validateUpdateNote(body) {
  const payload = ensurePlainObject(body);
  const errors = [];
  const changes = {};
  rejectServerOwnedFields(payload, errors);

  if (payload.title !== undefined) {
    changes.title = validateTitle(payload.title, errors, { maxLength: NOTE_TITLE_MAX_LENGTH });
  }
  if (payload.content !== undefined) {
    changes.content = validateText(payload.content, errors, {
      field: 'content',
      label: 'Content',
      maxLength: NOTE_CONTENT_MAX_LENGTH,
    });
  }

  if (errors.length === 0 && Object.keys(changes).length === 0) {
    addError(errors, 'body', 'Provide at least one field to update: title or content');
  }

  throwIfInvalid(errors, 'Note update is invalid');
  return changes;
}

/** Validates the query string of GET /api/notes (only `search` is supported). */
export function validateNoteQuery(query = {}) {
  const errors = [];
  const result = { ...DEFAULT_NOTE_QUERY };

  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      addError(errors, 'search', 'Search must be a single text value');
    } else {
      result.search = trimString(query.search).slice(0, 100);
    }
  }

  throwIfInvalid(errors, 'Invalid note filters');
  return result;
}
