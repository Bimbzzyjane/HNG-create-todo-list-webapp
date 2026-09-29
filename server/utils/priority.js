/**
 * Priority is a small, closed set of values shared by validation, sorting and
 * dashboard statistics.
 */
export const PRIORITIES = Object.freeze(['low', 'medium', 'high']);

/** Default priority for new todos. */
export const DEFAULT_PRIORITY = 'medium';

/** Numeric weight used when sorting by priority (high -> 3). */
export const PRIORITY_WEIGHT = Object.freeze({ low: 1, medium: 2, high: 3 });

/** True when `value` is one of the supported priority values. */
export function isValidPriority(value) {
  return typeof value === 'string' && PRIORITIES.includes(value.trim().toLowerCase());
}

/** Normalises user input (" High ") into the canonical form ("high"). */
export function normalizePriority(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}
