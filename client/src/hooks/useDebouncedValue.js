import { useEffect, useState } from 'react';

/**
 * Returns `value` after it has stopped changing for `delay` milliseconds.
 * Used so typing in the search box does not fire a request on every keystroke.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
