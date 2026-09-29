import { describe, expect, it } from 'vitest';
import {
  daysUntil,
  formatDueDate,
  isDueToday,
  isOverdue,
  formatDateTime,
  getGreeting,
} from './formatDate.js';

/** Calendar day helpers so the tests never depend on a fixed clock. */
function dayFromToday(offsetDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

describe('formatDate utilities', () => {
  it('formats a date and a date-time', () => {
    expect(formatDateTime('2025-09-16T10:15:00.000Z')).toMatch(/2025/);
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime('not-a-date')).toBe('');
  });

  it('counts whole days until a due date', () => {
    expect(daysUntil(dayFromToday(0))).toBe(0);
    expect(daysUntil(dayFromToday(3))).toBe(3);
    expect(daysUntil(dayFromToday(-2))).toBe(-2);
    expect(daysUntil(null)).toBeNull();
  });

  it('flags overdue and due-today dates', () => {
    expect(isOverdue(dayFromToday(-1))).toBe(true);
    expect(isOverdue(dayFromToday(0))).toBe(false);
    expect(isDueToday(dayFromToday(0))).toBe(true);
    expect(isDueToday(dayFromToday(2))).toBe(false);
    expect(isOverdue(null)).toBe(false);
  });

  it('builds human friendly due-date labels', () => {
    expect(formatDueDate(dayFromToday(0))).toBe('Today');
    expect(formatDueDate(dayFromToday(1))).toBe('Tomorrow');
    expect(formatDueDate(dayFromToday(3))).toBe('In 3 days');
    expect(formatDueDate(dayFromToday(-1))).toBe('1 day late');
    expect(formatDueDate(dayFromToday(-4))).toBe('4 days late');
    expect(formatDueDate(null)).toBe('No due date');
    expect(formatDueDate(dayFromToday(30))).toMatch(/\d{4}/);
  });

  it('returns the current time of day greeting', () => {
    expect(getGreeting(new Date('2025-09-16T08:00:00'))).toBe('Good morning');
    expect(getGreeting(new Date('2025-09-16T14:00:00'))).toBe('Good afternoon');
    expect(getGreeting(new Date('2025-09-16T20:00:00'))).toBe('Good evening');
  });
});
