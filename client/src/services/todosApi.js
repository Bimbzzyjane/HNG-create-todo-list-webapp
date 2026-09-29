import { apiClient } from './apiClient.js';
import { buildQueryString } from './queryString.js';

/** Default filters, mirrored from the API so the URL stays clean. */
export const DEFAULT_TODO_FILTERS = Object.freeze({
  search: '',
  status: 'all',
  priority: 'all',
  sort: 'created_at',
  order: 'desc',
});

/**
 * Todo endpoints.
 * `signal` can be passed so a component can cancel a request when it unmounts.
 */
export const todosApi = {
  /** GET /api/todos - returns { items, meta } */
  async list(filters = {}, { signal } = {}) {
    const query = buildQueryString(
      { ...DEFAULT_TODO_FILTERS, ...filters },
      DEFAULT_TODO_FILTERS,
    );
    const payload = await apiClient.get(`/todos${query}`, { signal });
    return { items: payload?.data ?? [], meta: payload?.meta ?? null };
  },

  /** GET /api/todos/:id */
  async getById(id, { signal } = {}) {
    const payload = await apiClient.get(`/todos/${id}`, { signal });
    return payload.data;
  },

  /** POST /api/todos */
  async create(todo) {
    const payload = await apiClient.post('/todos', todo);
    return payload.data;
  },

  /** PUT /api/todos/:id - full replace */
  async replace(id, todo) {
    const payload = await apiClient.put(`/todos/${id}`, todo);
    return payload.data;
  },

  /** PATCH /api/todos/:id - partial update */
  async update(id, changes) {
    const payload = await apiClient.patch(`/todos/${id}`, changes);
    return payload.data;
  },

  /** DELETE /api/todos/:id */
  async remove(id) {
    const payload = await apiClient.delete(`/todos/${id}`);
    return payload.data;
  },

  /** DELETE /api/todos/completed */
  async clearCompleted() {
    const payload = await apiClient.delete('/todos/completed');
    return payload.data;
  },
};
