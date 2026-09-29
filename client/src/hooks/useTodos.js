import { useCallback, useEffect, useMemo, useState } from 'react';
import { todosApi } from '../services/todosApi.js';
import { getErrorMessage, isAbortError } from '../services/apiClient.js';
import { useDebouncedValue } from './useDebouncedValue.js';

const EMPTY_COUNTS = { all: 0, pending: 0, completed: 0, low: 0, medium: 0, high: 0 };
const EMPTY_META = { count: 0, total: 0, counts: EMPTY_COUNTS };

/**
 * Loads todos from the API and exposes the mutations a page needs.
 *
 * The API is the single source of truth: after every change the list is fetched
 * again, so the UI can never drift away from the server data.
 */
export function useTodos({
  search = '',
  status = 'all',
  priority = 'all',
  sort = 'created_at',
  order = 'desc',
} = {}) {
  const debouncedSearch = useDebouncedValue(search, 300);

  const [todos, setTodos] = useState([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(
    () => ({ search: debouncedSearch, status, priority, sort, order }),
    [debouncedSearch, status, priority, sort, order],
  );

  const load = useCallback(
    async ({ signal } = {}) => {
      setLoading(true);
      try {
        const response = await todosApi.list(filters, { signal });
        setTodos(response.items);
        setMeta(response.meta ?? EMPTY_META);
        setError('');
      } catch (loadError) {
        if (!isAbortError(loadError)) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    const controller = new AbortController();
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  const refresh = useCallback(() => load(), [load]);

  const createTodo = useCallback(
    async (payload) => {
      const created = await todosApi.create(payload);
      await load();
      return created;
    },
    [load],
  );

  const updateTodo = useCallback(
    async (id, changes) => {
      const updated = await todosApi.update(id, changes);
      await load();
      return updated;
    },
    [load],
  );

  const toggleTodo = useCallback(
    async (todo) => {
      const updated = await todosApi.update(todo.id, { completed: !todo.completed });
      await load();
      return updated;
    },
    [load],
  );

  const deleteTodo = useCallback(
    async (id) => {
      const deleted = await todosApi.remove(id);
      await load();
      return deleted;
    },
    [load],
  );

  const clearCompleted = useCallback(async () => {
    const result = await todosApi.clearCompleted();
    await load();
    return result;
  }, [load]);

  return {
    todos,
    meta,
    loading,
    error,
    filters,
    refresh,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
  };
}
