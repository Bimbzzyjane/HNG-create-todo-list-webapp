/** Helpers for working with the ISO date strings stored on todos. */

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A due date is valid when it is a parseable ISO-8601 string, either a plain
 * date ("2030-04-01") or a full timestamp ("2030-04-01T09:30:00.000Z").
 */
export function isValidDateString(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (DATE_ONLY_PATTERN.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  }
  return !Number.isNaN(new Date(trimmed).getTime());
}

/** Normalises a valid date string (or null/undefined) into a canonical form. */
export function normalizeDateString(value) {
  if (value === null || value === undefined || value === '') return null;
  const trimmed = String(value).trim();
  if (DATE_ONLY_PATTERN.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`).toISOString();
  }
  return new Date(trimmed).toISOString();
}

/**
 * The calendar day ("YYYY-MM-DD") of an ISO value.
 *
 * Due dates are compared as calendar days rather than instants, so a todo due
 * "today" stays "today" whatever timezone the server runs in. Date-only strings
 * also compare correctly with `<` and `>`.
 */
export function toDateOnly(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

/** Today's calendar day as "YYYY-MM-DD". */
export function today(referenceDate = new Date()) {
  return referenceDate.toISOString().slice(0, 10);
}

/** True when the due date falls before today's calendar day. */
export function isOverdue(dueDate, referenceDate = new Date()) {
  const due = toDateOnly(dueDate);
  return Boolean(due) && due < today(referenceDate);
}

/** True when the due date falls on today's calendar day. */
export function isDueToday(dueDate, referenceDate = new Date()) {
  const due = toDateOnly(dueDate);
  return Boolean(due) && due === today(referenceDate);
}
