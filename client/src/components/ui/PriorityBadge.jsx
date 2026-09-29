import { getPriorityLabel } from '../../utils/priority.js';

/** Coloured pill that shows a todo priority (High / Medium / Low). */
export default function PriorityBadge({ priority = 'medium' }) {
  return <span className={`badge badge--priority-${priority}`}>{getPriorityLabel(priority)}</span>;
}
