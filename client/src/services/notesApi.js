import { apiClient } from './apiClient.js';
import { buildQueryString } from './queryString.js';

/** Note endpoints. */
export const notesApi = {
  /** GET /api/notes - returns { items, meta } */
  async list({ search = '' } = {}, { signal } = {}) {
    const query = buildQueryString({ search });
    const payload = await apiClient.get(`/notes${query}`, { signal });
    return { items: payload?.data ?? [], meta: payload?.meta ?? null };
  },

  /** GET /api/notes/:id */
  async getById(id, { signal } = {}) {
    const payload = await apiClient.get(`/notes/${id}`, { signal });
    return payload.data;
  },

  /** POST /api/notes */
  async create(note) {
    const payload = await apiClient.post('/notes', note);
    return payload.data;
  },

  /** PUT /api/notes/:id - full replace */
  async replace(id, note) {
    const payload = await apiClient.put(`/notes/${id}`, note);
    return payload.data;
  },

  /** PATCH /api/notes/:id - partial update */
  async update(id, changes) {
    const payload = await apiClient.patch(`/notes/${id}`, changes);
    return payload.data;
  },

  /** DELETE /api/notes/:id */
  async remove(id) {
    const payload = await apiClient.delete(`/notes/${id}`);
    return payload.data;
  },
};
