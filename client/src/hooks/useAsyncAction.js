import { useCallback, useState } from 'react';
import { getErrorMessage } from '../services/apiClient.js';

/**
 * Wraps an async action (create, update, delete...) with pending and error
 * state, so pages do not repeat the same try/catch/finally block.
 *
 * `run` resolves with the action result, or `undefined` when it failed.
 * The failure message is available on `error`.
 */
export function useAsyncAction(action) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(
    async (...args) => {
      setPending(true);
      setError('');

      try {
        return await action(...args);
      } catch (actionError) {
        setError(getErrorMessage(actionError));
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [action],
  );

  const clearError = useCallback(() => setError(''), []);

  return { run, pending, error, clearError, setError };
}
