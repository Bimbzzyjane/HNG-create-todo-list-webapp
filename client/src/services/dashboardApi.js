import { apiClient } from './apiClient.js';

/** Dashboard endpoints. */
export const dashboardApi = {
  /** GET /api/dashboard/stats */
  async getStats({ signal } = {}) {
    const payload = await apiClient.get('/dashboard/stats', { signal });
    return payload.data;
  },

  /** GET /api/health - used to show whether the API is reachable. */
  async getHealth({ signal } = {}) {
    const payload = await apiClient.get('/health', { signal });
    return payload.data;
  },
};
