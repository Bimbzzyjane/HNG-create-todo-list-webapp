/**
 * Client side form validation.
 *
 * The API remains the source of truth - these checks only give the user faster
 * feedback and keep the rules identical to the backend validators.
 */

const TODO_TITLE_MAX_LENGTH = 120;
const TODO_DESCRIPTION_MAX_LENGTH = 1000;
const NOTE_TITLE_MAX_LENGTH = 160;
const NOTE_CONTENT_MAX_LENGTH = 5000;

/** Validates the todo form and returns an object of field errors. */
export function validateTodoForm(values) {
  const errors = {};
  const title = (values.title ?? '').trim();

  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length > TODO_TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TODO_TITLE_MAX_LENGTH} characters or fewer`;
  }

  const description = (values.description ?? '').trim();
  if (description.length > TODO_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${TODO_DESCRIPTION_MAX_LENGTH} characters or fewer`;
  }

  if (values.due_date && Number.isNaN(new Date(values.due_date).getTime())) {
    errors.due_date = 'Enter a valid date';
  }

  return errors;
}

/** Validates the note form and returns an object of field errors. */
export function validateNoteForm(values) {
  const errors = {};
  const title = (values.title ?? '').trim();

  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length > NOTE_TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${NOTE_TITLE_MAX_LENGTH} characters or fewer`;
  }

  const content = (values.content ?? '').trim();
  if (content.length > NOTE_CONTENT_MAX_LENGTH) {
    errors.content = `Content must be ${NOTE_CONTENT_MAX_LENGTH} characters or fewer`;
  }

  return errors;
}

/** True when a validation result contains no errors. */
export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}

/**
 * Converts todo form values into an API payload.
 * An empty date input becomes null ("no due date") instead of an empty string.
 */
export function toTodoPayload(values) {
  return {
    title: (values.title ?? '').trim(),
    description: (values.description ?? '').trim(),
    priority: values.priority || 'medium',
    due_date: values.due_date ? values.due_date : null,
    completed: Boolean(values.completed),
  };
}

/** Converts note form values into an API payload. */
export function toNotePayload(values) {
  return {
    title: (values.title ?? '').trim(),
    content: (values.content ?? '').trim(),
  };
}

/** Turns an ISO timestamp into the "YYYY-MM-DD" value an date input expects. */
export function toDateInputValue(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}
