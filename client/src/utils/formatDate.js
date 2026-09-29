/**
 * Date helpers for the UI.
 *
 * The API stores ISO strings. These helpers convert them into short, readable
 * labels and reuse the same calendar-day comparison as the backend so "Today"
 * and "Overdue" always agree with the dashboard statistics.
 */

const DATE_ONLY_LENGTH = 10;

/** Formats an ISO string as "Sep 16, 2025". */
export function formatDate(value, locale = undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/** Formats an ISO string as "Sep 16, 2025 · 10:15 PM". */
export function formatDateTime(value, locale = undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = formatDate(value, locale);
  const time = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  return `${day} · ${time}`;
}

/** The calendar day ("YYYY-MM-DD") of an ISO value, in UTC. */
export function toDateOnly(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, DATE_ONLY_LENGTH);
}

/** Today's calendar day as "YYYY-MM-DD". */
export function today(referenceDate = new Date()) {
  return referenceDate.toISOString().slice(0, DATE_ONLY_LENGTH);
}

/** Whole days from today until the due date (negative when overdue). */
export function daysUntil(value, referenceDate = new Date()) {
  const due = toDateOnly(value);
  if (!due) return null;

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const difference =
    new Date(`${due}T00:00:00.000Z`).getTime() -
    new Date(`${today(referenceDate)}T00:00:00.000Z`).getTime();

  return Math.round(difference / millisecondsPerDay);
}

/** True when the due date is before today. */
export function isOverdue(value, referenceDate = new Date()) {
  const days = daysUntil(value, referenceDate);
  return days !== null && days < 0;
}

/** True when the due date is today. */
export function isDueToday(value, referenceDate = new Date()) {
  return daysUntil(value, referenceDate) === 0;
}

/**
 * Human friendly due-date label: "Today", "Tomorrow", "3 days late",
 * "Sep 20, 2025" and so on.
 */
export function formatDueDate(value, referenceDate = new Date()) {
  const days = daysUntil(value, referenceDate);
  if (days === null) return 'No due date';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return '1 day late';
  if (days < 0) return `${Math.abs(days)} days late`;
  if (days <= 6) return `In ${days} days`;
  return formatDate(value);
}

/** Current time of day, used for the greeting in the header. */
export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Formats a date as "Tue, Sep 16, 2025". */
export function formatLongDate(date = new Date(), locale = undefined) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/** Formats a time as "10:32 PM". */
export function formatTime(date = new Date(), locale = undefined) {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
