/** Small, dependency-free text helpers shared by validators. */

/** Trim a value when it is a string, otherwise return it untouched. */
export function trimString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Case-insensitive "contains" check used by search.
 * Missing values are treated as empty strings so search never throws.
 */
export function matchesSearch(haystack, needle) {
  if (!needle) return true;
  return String(haystack ?? '')
    .toLowerCase()
    .includes(String(needle).trim().toLowerCase());
}
