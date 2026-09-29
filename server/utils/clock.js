/**
 * Monotonic ISO clock.
 *
 * `Date.now()` has millisecond precision, so two records created in the same
 * millisecond would receive identical timestamps. That makes ordering (and
 * tests) flaky. This clock guarantees each returned timestamp is strictly newer
 * than the previous one.
 */
let lastTimestamp = 0;

/** Current time as a strictly increasing ISO-8601 string. */
export function nowIso() {
  lastTimestamp = Math.max(Date.now(), lastTimestamp + 1);
  return new Date(lastTimestamp).toISOString();
}

/** Resets the internal counter (used by tests). */
export function resetClock() {
  lastTimestamp = 0;
}
