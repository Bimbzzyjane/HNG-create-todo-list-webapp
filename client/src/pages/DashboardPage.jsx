import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import Icon from '../components/ui/Icons.jsx';
import PriorityBadge from '../components/ui/PriorityBadge.jsx';
import StatsCard from '../components/ui/StatsCard.jsx';
import NoteCard from '../components/notes/NoteCard.jsx';
import { useDashboardStats } from '../hooks/useDashboardStats.js';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import { todosApi } from '../services/todosApi.js';
import { getDueDateTone, getDueDateHint } from '../utils/priority.js';
import { formatDueDate } from '../utils/formatDate.js';

/**
 * Dashboard: a quick-add box, the key statistics and a short list of the most
 * recent activity. Every number comes from GET /api/dashboard/stats.
 */
export default function DashboardPage() {
  const { stats, loading, error, refresh } = useDashboardStats();
  const [quickTitle, setQuickTitle] = useState('');

  const createTodo = useCallback((title) => todosApi.create({ title }), []);
  const { run: addQuickTodo, pending: addingTodo, error: quickError, clearError } = useAsyncAction(createTodo);

  async function handleQuickAdd(event) {
    event.preventDefault();

    const title = quickTitle.trim();
    if (!title) return;

    const created = await addQuickTodo(title);
    if (created) {
      setQuickTitle('');
      clearError();
      await refresh();
    }
  }

  return (
    <div className="stack">
      <section className="hero" aria-labelledby="quick-add-heading">
        <div className="hero__content">
          <h2 id="quick-add-heading">What would you like to get done?</h2>
          <p>Capture a task now - it appears on your todo list immediately.</p>

          <form className="hero__form" onSubmit={handleQuickAdd}>
            <label className="visually-hidden" htmlFor="quick-todo">
              Quick add a todo
            </label>
            <input
              id="quick-todo"
              type="text"
              className="input hero__input"
              value={quickTitle}
              onChange={(event) => setQuickTitle(event.target.value)}
              placeholder="Enter a new todo..."
              maxLength={120}
            />
            <Button type="submit" icon="plus" loading={addingTodo}>
              Add todo
            </Button>
          </form>

          {quickError ? (
            <p className="form__error" role="alert">
              {quickError}
            </p>
          ) : null}
        </div>

        <div className="hero__art" aria-hidden="true">
          <span className="hero__art-tile">
            <Icon name="checkSquare" size={38} />
          </span>
        </div>
      </section>

      <ErrorAlert title="Could not load your dashboard" message={error} onRetry={refresh} />

      {stats.todos.overdue > 0 ? (
        <p className="notice notice--warning" role="status">
          <Icon name="alert" size={18} />
          {stats.todos.overdue === 1
            ? '1 todo is overdue.'
            : `${stats.todos.overdue} todos are overdue.`}
        </p>
      ) : null}

      <section aria-labelledby="overview-heading">
        <h2 className="visually-hidden" id="overview-heading">
          Overview
        </h2>

        <div className="stats-grid">
          <StatsCard
            label="Total todos"
            value={stats.todos.total}
            hint={`${stats.todos.completionRate}% completed`}
            icon="todos"
            tone="indigo"
            loading={loading}
          />
          <StatsCard
            label="Pending"
            value={stats.todos.pending}
            hint={`${stats.todos.dueToday} due today`}
            icon="clock"
            tone="amber"
            loading={loading}
          />
          <StatsCard
            label="Completed"
            value={stats.todos.completed}
            hint="Keep the streak going"
            icon="checkSquare"
            tone="green"
            loading={loading}
          />
          <StatsCard
            label="High priority"
            value={stats.todos.highPriority}
            hint={`${stats.todos.highPriorityPending} still open`}
            icon="flag"
            tone="rose"
            loading={loading}
          />
          <StatsCard
            label="Notes"
            value={stats.notes.total}
            hint="Ideas and reminders"
            icon="notes"
            tone="sky"
            loading={loading}
          />
        </div>
      </section>

      <div className="page__grid">
        <section className="card" aria-labelledby="recent-todos-heading">
          <div className="section-title">
            <h2 id="recent-todos-heading">Recent todos</h2>
            <Link to="/todos" className="text-link">
              All todos
              <Icon name="todos" size={16} />
            </Link>
          </div>

          {stats.recentTodos.length === 0 ? (
            <EmptyState
              icon="todos"
              title="Nothing here yet"
              message="Add a todo above and it will show up in this list."
            />
          ) : (
            <ul className="mini-list">
              {stats.recentTodos.map((todo) => (
                <li key={todo.id} className={todo.completed ? 'mini-item is-completed' : 'mini-item'}>
                  <Icon
                    name={todo.completed ? 'checkSquare' : 'circle'}
                    size={18}
                    className="mini-item__icon"
                  />
                  <div className="mini-item__body">
                    <p className="mini-item__title">{todo.title}</p>
                    <p
                      className={`mini-item__meta mini-item__meta--${getDueDateTone(todo.due_date)}`}
                      title={getDueDateHint(todo.due_date)}
                    >
                      <Icon name="calendar" size={14} />
                      {formatDueDate(todo.due_date)}
                    </p>
                  </div>
                  <PriorityBadge priority={todo.priority} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="recent-notes-heading">
          <div className="section-title">
            <h2 id="recent-notes-heading">Latest notes</h2>
            <Link to="/notes" className="text-link">
              All notes
              <Icon name="notes" size={16} />
            </Link>
          </div>

          {stats.recentNotes.length === 0 ? (
            <EmptyState
              icon="notes"
              title="No notes yet"
              message="Use notes for checklists, ideas and reminders."
            />
          ) : (
            <div className="notes-grid notes-grid--compact">
              {stats.recentNotes.map((note, index) => (
                <NoteCard key={note.id} note={note} index={index} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
