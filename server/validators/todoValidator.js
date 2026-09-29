import { AppError } from '../utils/AppError.js';
import { PRIORITIES } from '../utils/priority.js';
import { trimString } from '../utils/text.js';
import {
  addError,
  throwIfInvalid,
  rejectServerOwnedFields,
  validateTitle,
  validateText,
  validatePriority,
  validateDueDate,
  validateCompleted,
  DESCRIPTION_MAX_LENGTH,
} from './fields.js';

/** Values accepted by the `status` filter. */
export const TODO_STATUS_FILTERS = Object.freeze(['all', 'pending', 'completed']);

/** Fields accepted by the `sort` query parameter. */
export const TODO_SORT_FIELDS = Object.freeze(['created_at', 'updated_at', 'due_date', 'priority', 'title']);

/** Query defaults, also used by the service layer. */
export const DEFAULT_TODO_QUERY = Object.freeze({
  search: '',
  status: 'all',
  priority: 'all',
  sort: 'created_at',
  order: 'desc',
});

function ensurePlainObject(body) {
  if (body === undefined || body === null) return {};
  if (typeof body !== 'object' || Array.isArray(body)) {
    throw AppError.badRequest('Request body must be a JSON object');
  }
  return body;
}

/**
 * Validates the body of POST /api/todos and PUT /api/todos/:id.
 * Returns a complete, normalised todo (defaults are applied).
 */
export function validateCreateTodo(body) {
  const payload = ensurePlainObject(body);
  const errors = [];
  rejectServerOwnedFields(payload, errors);

  const todo = {
    title: validateTitle(payload.title, errors),
    description: validateText(payload.description, errors, {
      field: 'description',
      label: 'Description',
      maxLength: DESCRIPTION_MAX_LENGTH,
    }),
    priority: validatePriority(payload.priority, errors),
    due_date: validateDueDate(payload.due_date, errors),
    completed: validateCompleted(payload.completed, errors),
  };

  throwIfInvalid(errors, 'Todo payload is invalid');
  return todo;
}

/**
 * Validates the body of PATCH /api/todos/:id.
 * Only the supplied fields are returned, so untouched data is preserved.
 */
export function validateUpdateTodo(body) {
  const payload = ensurePlainObject(body);
  const errors = [];
  const changes = {};
  rejectServerOwnedFields(payload, errors);

  if (payload.title !== undefined) {
    changes.title = validateTitle(payload.title, errors);
  }
  if (payload.description !== undefined) {
    changes.description = validateText(payload.description, errors, {
      field: 'description',
      label: 'Description',
      maxLength: DESCRIPTION_MAX_LENGTH,
    });
  }
  if (payload.priority !== undefined) {
    changes.priority = validatePriority(payload.priority, errors, { required: true });
  }
  if (payload.due_date !== undefined) {
    changes.due_date = validateDueDate(payload.due_date, errors);
  }
  if (payload.completed !== undefined) {
    changes.completed = validateCompleted(payload.completed, errors);
  }

  if (errors.length === 0 && Object.keys(changes).length === 0) {
    addError(
      errors,
      'body',
      'Provide at least one field to update: title, description, priority, due_date or completed',
    );
  }

  throwIfInvalid(errors, 'Todo update is invalid');
  return changes;
}

/** Validates the query string of GET /api/todos. */
export function validateTodoQuery(query = {}) {
  const errors = [];
  const result = { ...DEFAULT_TODO_QUERY };

  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      addError(errors, 'search', 'Search must be a single text value');
    } else {
      result.search = trimString(query.search).slice(0, 100);
    }
  }

  if (query.status !== undefined) {
    const status = typeof query.status === 'string' ? query.status.trim().toLowerCase() : query.status;
    if (!TODO_STATUS_FILTERS.includes(status)) {
      addError(errors, 'status', `Status must be one of: ${TODO_STATUS_FILTERS.join(', ')}`);
    } else {
      result.status = status;
    }
  }

  if (query.priority !== undefined) {
    const priority = typeof query.priority === 'string' ? query.priority.trim().toLowerCase() : query.priority;
    if (priority !== 'all' && !PRIORITIES.includes(priority)) {
      addError(errors, 'priority', `Priority must be "all" or one of: ${PRIORITIES.join(', ')}`);
    } else {
      result.priority = priority;
    }
  }

  if (query.sort !== undefined) {
    const sort = typeof query.sort === 'string' ? query.sort.trim().toLowerCase() : query.sort;
    if (!TODO_SORT_FIELDS.includes(sort)) {
      addError(errors, 'sort', `Sort must be one of: ${TODO_SORT_FIELDS.join(', ')}`);
    } else {
      result.sort = sort;
    }
  }

  if (query.order !== undefined) {
    const order = typeof query.order === 'string' ? query.order.trim().toLowerCase() : query.order;
    if (!['asc', 'desc'].includes(order)) {
      addError(errors, 'order', 'Order must be "asc" or "desc"');
    } else {
      result.order = order;
    }
  }

  throwIfInvalid(errors, 'Invalid todo filters');
  return result;
}
