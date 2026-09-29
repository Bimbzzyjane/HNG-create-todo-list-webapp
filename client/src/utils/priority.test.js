import { describe, expect, it } from 'vitest';
import {
  getDueDateHint,
  getDueDateTone,
  getNotePreviewLines,
  getNoteTone,
  getPriorityLabel,
  PRIORITY_OPTIONS,
} from './priority.js';

function dayFromToday(offsetDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

describe('priority utilities', () => {
  it('exposes the three priority values used by the API', () => {
    expect(PRIORITY_OPTIONS.map((option) => option.value)).toEqual(['low', 'medium', 'high']);
  });

  it('labels priorities and falls back to Medium', () => {
    expect(getPriorityLabel('high')).toBe('High');
    expect(getPriorityLabel('low')).toBe('Low');
    expect(getPriorityLabel(undefined)).toBe('Medium');
  });

  it('derives a due-date tone', () => {
    expect(getDueDateTone(null)).toBe('none');
    expect(getDueDateTone(dayFromToday(-3))).toBe('overdue');
    expect(getDueDateTone(dayFromToday(0))).toBe('today');
    expect(getDueDateTone(dayFromToday(5))).toBe('upcoming');
  });

  it('describes how soon a todo is due', () => {
    expect(getDueDateHint(dayFromToday(-1))).toBe('Overdue');
    expect(getDueDateHint(dayFromToday(0))).toBe('Due today');
    expect(getDueDateHint(dayFromToday(4))).toBe('Upcoming');
    expect(getDueDateHint(null)).toBe('No due date');
  });

  it('assigns a stable pastel tone per note', () => {
    const note = { id: 'aaaa-bbbb-cccc' };

    expect(getNoteTone(note)).toBe(getNoteTone(note));
    expect(['lavender', 'sky', 'mint', 'amber']).toContain(getNoteTone(note));
  });

  it('turns note content into a short bullet preview', () => {
    const content = '- First line\n* Second line\n\nThird line\nFourth line\nFifth line';

    expect(getNotePreviewLines(content, 3)).toEqual(['First line', 'Second line', 'Third line']);
    expect(getNotePreviewLines('')).toEqual([]);
    expect(getNotePreviewLines(null)).toEqual([]);
  });
});
