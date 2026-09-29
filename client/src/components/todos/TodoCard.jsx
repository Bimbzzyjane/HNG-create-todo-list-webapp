import Icon from '../ui/Icons.jsx';
import Button from '../ui/Button.jsx';
import PriorityBadge from '../ui/PriorityBadge.jsx';
import { formatDateTime, formatDueDate } from '../../utils/formatDate.js';
import { getDueDateTone } from '../../utils/priority.js';

/**
 * A single todo row.
 *
 * Completed todos always look different: filled checkbox, struck-through title
 * and reduced emphasis, so progress is obvious at a glance.
 */
export default function TodoCard({ todo, onToggle, onEdit, onDelete, busy = false }) {
  const dueTone = getDueDateTone(todo.due_date);

  return (
    <article className={todo.completed ? 'todo-card is-completed' : 'todo-card'}>
      <div className="todo-card__check">
        <input
          id={`todo-toggle-${todo.id}`}
          type="checkbox"
          className="checkbox"
          checked={todo.completed}
          disabled={busy}
          onChange={() => onToggle(todo)}
          aria-label={
            todo.completed
              ? `Mark "${todo.title}" as not completed`
              : `Mark "${todo.title}" as completed`
          }
        />
      </div>

      <div className="todo-card__main">
        <h3 className="todo-card__title">{todo.title}</h3>

        {todo.description ? (
          <p className="todo-card__description">{todo.description}</p>
        ) : null}

        <div className="todo-card__meta">
          <span className={`todo-card__due todo-card__due--${dueTone}`}>
            <Icon name="calendar" size={15} />
            {formatDueDate(todo.due_date)}
          </span>
          <span className="text-subtle">Updated {formatDateTime(todo.updated_at)}</span>
        </div>
      </div>

      <div className="todo-card__side">
        <PriorityBadge priority={todo.priority} />

        <div className="todo-card__actions">
          <Button
            variant="ghost"
            size="sm"
            icon="pencil"
            onClick={() => onEdit(todo)}
            aria-label={`Edit "${todo.title}"`}
            disabled={busy}
          />
          <Button
            variant="danger-ghost"
            size="sm"
            icon="trash"
            onClick={() => onDelete(todo)}
            aria-label={`Delete "${todo.title}"`}
            disabled={busy}
          />
        </div>
      </div>
    </article>
  );
}
