import { isDueToday, isOverdue } from './formatDate.js';

/** Priority values shared with the API. */
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

/** Filter chips above the todo list. */
export const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export const PRIORITY_FILTERS = [
  { value: 'all', label: 'All priorities' },
  { value: 'high', label: 'High priority' },
  { value: 'medium', label: 'Medium priority' },
  { value: 'low', label: 'Low priority' },
];

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'due_date', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title (A-Z)' },
];

/** "high" -> "High" */
export function getPriorityLabel(priority) {
  return PRIORITY_LABELS[priority] ?? 'Medium';
}

/**
 * Visual tone for a due date: overdue, due today, upcoming or none.
 * Used for the colour of the due-date line on a todo card.
 */
export function getDueDateTone(dueDate) {
  if (!dueDate) return 'none';
  if (isOverdue(dueDate)) return 'overdue';
  if (isDueToday(dueDate)) return 'today';
  return 'upcoming';
}

/** Short description of how soon a todo is due. */
export function getDueDateHint(dueDate) {
  if (!dueDate) return 'No due date';
  if (isOverdue(dueDate)) return 'Overdue';
  if (isDueToday(dueDate)) return 'Due today';
  return 'Upcoming';
}

/**
 * Deterministic pastel tone for a note card, based on its id.
 * The same note always keeps the same colour while the list is rendered.
 */
const NOTE_TONES = ['lavender', 'sky', 'mint', 'amber'];

export function getNoteTone(note, index = 0) {
  const seed = String(note?.id ?? index);
  let hash = 0;
  for (let position = 0; position < seed.length; position += 1) {
    hash = (hash * 31 + seed.charCodeAt(position)) % 100000;
  }
  return NOTE_TONES[hash % NOTE_TONES.length];
}

/** Splits note content into lines for the bullet preview on a card. */
export function getNotePreviewLines(content, maxLines = 4) {
  if (!content) return [];
  return content
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, maxLines);
}
