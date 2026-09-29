/**
 * Demo data used when the server starts with SEED_DATA=true.
 * The content is written for this project only - change it freely.
 */
import { generateId } from '../utils/idGenerator.js';

/** Offsets are relative to "now" so the dashboard always looks alive. */
function dayOffset(days, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/** Builds a todo record with defaulted fields. */
function todo({ title, description, priority, dueDate, completed = false, createdAt, updatedAt }) {
  return {
    id: generateId(),
    title,
    description,
    completed,
    priority,
    due_date: dueDate,
    created_at: createdAt,
    updated_at: updatedAt ?? createdAt,
  };
}

/** Builds a note record with defaulted fields. */
function note({ title, content, createdAt, updatedAt }) {
  return {
    id: generateId(),
    title,
    content,
    created_at: createdAt,
    updated_at: updatedAt ?? createdAt,
  };
}

export function createSeedTodos() {
  return [
    todo({
      title: 'Ship the TaskNest REST API',
      description: 'Finish the todo and note endpoints, then add Supertest coverage for each route.',
      priority: 'high',
      dueDate: dayOffset(0, 17, 30),
      createdAt: hoursAgo(30),
    }),
    todo({
      title: 'Refactor the dashboard layout',
      description: 'Move the stat widgets into a responsive grid so the overview works on tablets too.',
      priority: 'medium',
      dueDate: dayOffset(3, 12, 0),
      createdAt: hoursAgo(26),
    }),
    todo({
      title: 'Review incoming pull requests',
      description: 'Read through the open PRs and leave notes before the afternoon sync.',
      priority: 'medium',
      dueDate: dayOffset(-2, 15, 0),
      createdAt: hoursAgo(22),
    }),
    todo({
      title: 'Document the in-memory data layer',
      description: 'Explain in the README how repositories can be swapped for a real database later.',
      priority: 'low',
      dueDate: dayOffset(9, 10, 0),
      createdAt: hoursAgo(18),
    }),
    todo({
      title: 'Wire up the continuous integration job',
      description: 'Run Vitest on every push and fail the build when a test breaks.',
      priority: 'high',
      dueDate: dayOffset(-4, 9, 0),
      completed: true,
      createdAt: hoursAgo(14),
    }),
    todo({
      title: 'Export notes into a plain text archive',
      description: 'Keep a readable backup of the notes collection.',
      priority: 'low',
      dueDate: null,
      completed: true,
      createdAt: hoursAgo(8),
    }),
  ];
}

export function createSeedNotes() {
  return [
    note({
      title: 'API sketch',
      content: [
        'GET /api/todos returns the filtered collection',
        'POST /api/todos validates the title and priority',
        'PATCH /api/todos/:id flips the completed flag',
        'GET /api/dashboard/stats feeds the overview cards',
      ].join('\n'),
      createdAt: hoursAgo(20),
    }),
    note({
      title: 'Design tokens',
      content: [
        'Canvas: soft off-white with a light lavender tint',
        'Sidebar: deep navy with an indigo active state',
        'Priority pills: rose, amber and sky',
        'Cards: 14px radius with a very soft shadow',
      ].join('\n'),
      createdAt: hoursAgo(12),
    }),
    note({
      title: 'Testing checklist',
      content: [
        'Reset the store before every test',
        'Assert status codes, not just payloads',
        'Cover search, filters and 404 responses',
        'Never rely on the order of other tests',
      ].join('\n'),
      createdAt: hoursAgo(6),
    }),
    note({
      title: 'Ideas parking lot',
      content: [
        'Drag and drop todo ordering',
        'Reminder notifications for due dates',
        'Persist data in PostgreSQL',
      ].join('\n'),
      createdAt: hoursAgo(2),
    }),
  ];
}
