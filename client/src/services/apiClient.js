/**
 * The single HTTP client used by the whole frontend.
 *
 * All requests go through here so error handling, JSON parsing and the API base
 * URL are defined once. Components never call `fetch` directly.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Error type thrown for any non successful API response. */
export class ApiError extends Error {
  constructor(message, { status = 500, code = 'REQUEST_FAILED', details = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** True when the request was cancelled (for example by an unmounting effect). */
export function isAbortError(error) {
  return error?.name === 'AbortError';
}

/** Turns any thrown value into a message that is safe to show in the UI. */
export function getErrorMessage(error) {
  if (isAbortError(error)) return '';
  if (error instanceof ApiError) return error.message;
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError('Cannot reach the API. Is the backend server running?', {
      status: 0,
      code: 'NETWORK_ERROR',
    });
  }

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(payload?.error?.message ?? `Request failed with status ${response.status}`, {
      status: response.status,
      code: payload?.error?.code ?? 'REQUEST_FAILED',
      details: payload?.error?.details ?? [],
    });
  }

  return payload;
}

/** Reads the JSON body, tolerating empty responses. */
async function parseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const apiClient = {
  baseUrl: API_BASE_URL,
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
