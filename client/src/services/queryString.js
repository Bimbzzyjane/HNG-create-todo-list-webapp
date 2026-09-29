/**
 * Builds a query string from a filters object.
 *
 * Empty values are skipped so the API receives only meaningful filters, and the
 * defaults ("all" / "created_at") are left out to keep URLs readable.
 */
export function buildQueryString(filters = {}, defaults = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const stringValue = String(value).trim();
    if (!stringValue) return;
    if (defaults[key] !== undefined && defaults[key] === stringValue) return;

    searchParams.set(key, stringValue);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
