import Icon from '../ui/Icons.jsx';
import Button from '../ui/Button.jsx';
import { PRIORITY_FILTERS, SORT_OPTIONS, STATUS_FILTERS } from '../../utils/priority.js';

/**
 * Search, filter and sort controls for the todo list.
 *
 * Every control calls back into the page, which turns the values into API query
 * parameters - filtering happens on the server, not in the browser.
 */
export default function TodoFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sort,
  onSortChange,
  counts = {},
  onClearCompleted,
  clearingCompleted = false,
}) {
  const countFor = (value) => counts[value] ?? 0;

  return (
    <section className="filter-bar" aria-label="Search and filter todos">
      <div className="filter-bar__search">
        <label className="visually-hidden" htmlFor="todo-search">
          Search todos by title or description
        </label>
        <Icon name="search" size={18} className="filter-bar__search-icon" />
        <input
          id="todo-search"
          type="search"
          className="input filter-bar__search-input"
          value={search}
          placeholder="Search title or description..."
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="chip-row" role="group" aria-label="Filter todos by status">
        {STATUS_FILTERS.map((option) => {
          const isActive = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={isActive ? 'chip is-active' : 'chip'}
              aria-pressed={isActive}
              onClick={() => onStatusChange(option.value)}
            >
              {option.label}
              <span className="chip__count">{countFor(option.value)}</span>
            </button>
          );
        })}
      </div>

      <div className="filter-bar__controls">
        <div className="field field--inline">
          <label className="visually-hidden" htmlFor="todo-priority-filter">
            Filter todos by priority
          </label>
          <select
            id="todo-priority-filter"
            className="select select--sm"
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
          >
            {PRIORITY_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field field--inline">
          <label className="visually-hidden" htmlFor="todo-sort">
            Sort todos
          </label>
          <select
            id="todo-sort"
            className="select select--sm"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {onClearCompleted ? (
          <Button
            variant="danger-ghost"
            size="sm"
            icon="trash"
            onClick={onClearCompleted}
            loading={clearingCompleted}
            disabled={countFor('completed') === 0}
          >
            Clear completed
          </Button>
        ) : null}
      </div>
    </section>
  );
}
