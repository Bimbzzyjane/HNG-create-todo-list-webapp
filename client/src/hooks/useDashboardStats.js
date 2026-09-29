import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '../services/dashboardApi.js';
import { getErrorMessage, isAbortError } from '../services/apiClient.js';

const EMPTY_STATS = {
  todos: {
    total: 0,
    pending: 0,
    completed: 0,
    highPriority: 0,
    highPriorityPending: 0,
    overdue: 0,
    dueToday: 0,
    completionRate: 0,
  },
  notes: { total: 0 },
  priorityBreakdown: { low: 0, medium: 0, high: 0 },
  recentTodos: [],
  recentNotes: [],
  generated_at: null,
};

/**
 * Loads the dashboard statistics from GET /api/dashboard/stats.
 * `refresh` is used after a quick-add so the numbers stay accurate.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async ({ signal } = {}) => {
    setLoading(true);
    try {
      const data = await dashboardApi.getStats({ signal });
      setStats({ ...EMPTY_STATS, ...data });
      setError('');
    } catch (loadError) {
      if (!isAbortError(loadError)) {
        setError(getErrorMessage(loadError));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  const refresh = useCallback(() => load(), [load]);

  return { stats, loading, error, refresh };
}
