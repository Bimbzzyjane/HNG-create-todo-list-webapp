import { useCallback, useEffect, useState } from 'react';
import { notesApi } from '../services/notesApi.js';
import { getErrorMessage, isAbortError } from '../services/apiClient.js';
import { useDebouncedValue } from './useDebouncedValue.js';

const EMPTY_META = { count: 0, total: 0 };

/**
 * Loads notes from the API and exposes the mutations the notes page needs.
 * Same contract as `useTodos`: the API owns the data, the hook only mirrors it.
 */
export function useNotes({ search = '' } = {}) {
  const debouncedSearch = useDebouncedValue(search, 300);

  const [notes, setNotes] = useState([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async ({ signal } = {}) => {
      setLoading(true);
      try {
        const response = await notesApi.list({ search: debouncedSearch }, { signal });
        setNotes(response.items);
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
    [debouncedSearch],
  );

  useEffect(() => {
    const controller = new AbortController();
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  const refresh = useCallback(() => load(), [load]);

  const createNote = useCallback(
    async (payload) => {
      const created = await notesApi.create(payload);
      await load();
      return created;
    },
    [load],
  );

  const updateNote = useCallback(
    async (id, payload) => {
      const updated = await notesApi.replace(id, payload);
      await load();
      return updated;
    },
    [load],
  );

  const deleteNote = useCallback(
    async (id) => {
      const deleted = await notesApi.remove(id);
      await load();
      return deleted;
    },
    [load],
  );

  return { notes, meta, loading, error, refresh, createNote, updateNote, deleteNote };
}
