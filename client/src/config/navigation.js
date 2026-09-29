/**
 * Navigation configuration.
 *
 * Keeping the links in one place means the sidebar, the mobile drawer and the
 * header title always agree with each other.
 */

export const APP_NAME = 'TaskNest';

export const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    description: 'An overview of your todos and notes.',
    icon: 'dashboard',
  },
  {
    to: '/todos',
    label: 'My Todos',
    description: 'Create, filter and complete your tasks.',
    icon: 'todos',
  },
  {
    to: '/notes',
    label: 'Notes',
    description: 'Capture ideas, lists and reminders.',
    icon: 'notes',
  },
];

/** Title and subtitle shown in the header for a given pathname. */
export function getPageMeta(pathname) {
  const match = NAV_ITEMS.find((item) => item.to === pathname);
  if (match) return { title: match.label, description: match.description };

  return { title: 'Not found', description: 'That page does not exist.' };
}
