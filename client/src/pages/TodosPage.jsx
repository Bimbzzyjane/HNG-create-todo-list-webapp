import { useMemo, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import Modal from '../components/ui/Modal.jsx';
import { SkeletonList } from '../components/ui/Skeleton.jsx';
import TodoCard from '../components/todos/TodoCard.jsx';
import TodoFilterBar from '../components/todos/TodoFilterBar.jsx';
import TodoForm from '../components/todos/TodoForm.jsx';
import { useTodos } from '../hooks/useTodos.js';
import { getErrorMessage } from '../services/apiClient.js';

const CLOSED_FORM = { open: false, mode: 'create', todo: null };

/**
 * Todos page: create, edit, complete, delete, search and filter.
 *
 * Filtering is delegated to the API through the `useTodos` hook, so this
 * component never keeps its own copy of the todo list as a source of truth.
 */
export default function TodosPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [sort, setSort] = useState('created_at');

  const {
    todos,
    meta,
    loading,
    error,
    refresh,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
  } = useTodos({ search, status, priority, sort });

  const [formState, setFormState] = useState(CLOSED_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [actionError, setActionError] = useState('');
  const [togglingId, setTogglingId] = useState('');
  const [clearingCompleted, setClearingCompleted] = useState(false);

  const hasFilters = useMemo(
    () => Boolean(search) || status !== 'all' || priority !== 'all',
    [search, status, priority],
  );

  const isFirstLoad = loading && todos.length === 0;

  function openCreateForm() {
    setFormError('');
    setFormState({ open: true, mode: 'create', todo: null });
  }

  function openEditForm(todo) {
    setFormError('');
    setFormState({ open: true, mode: 'edit', todo });
  }

  function closeForm() {
    if (saving) return;
    setFormError('');
    setFormState(CLOSED_FORM);
  }

  function resetFilters() {
    setSearch('');
    setStatus('all');
    setPriority('all');
  }

  async function handleFormSubmit(payload) {
    setSaving(true);
    setFormError('');

    try {
      if (formState.mode === 'edit' && formState.todo) {
        await updateTodo(formState.todo.id, payload);
      } else {
        await createTodo(payload);
      }
      setFormState(CLOSED_FORM);
    } catch (submitError) {
      setFormError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(todo) {
    setActionError('');
    setTogglingId(todo.id);

    try {
      await toggleTodo(todo);
    } catch (toggleError) {
      setActionError(getErrorMessage(toggleError));
    } finally {
      setTogglingId('');
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await deleteTodo(deleteTarget.id);
      setDeleteTarget(null);
    } catch (deleteFailure) {
      setDeleteError(getErrorMessage(deleteFailure));
    } finally {
      setDeleting(false);
    }
  }

  async function handleClearCompleted() {
    setActionError('');
    setClearingCompleted(true);

    try {
      await clearCompleted();
    } catch (clearError) {
      setActionError(getErrorMessage(clearError));
    } finally {
      setClearingCompleted(false);
    }
  }

  return (
    <div className="stack">
      <TodoFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        sort={sort}
        onSortChange={setSort}
        counts={meta?.counts ?? {}}
        onClearCompleted={handleClearCompleted}
        clearingCompleted={clearingCompleted}
      />

      <div className="row row--between row--wrap">
        <p className="text-subtle" aria-live="polite">
          {loading && !isFirstLoad
            ? 'Refreshing todos...'
            : `Showing ${meta?.count ?? 0} of ${meta?.total ?? 0} todos`}
        </p>
        <Button icon="plus" onClick={openCreateForm}>
          New todo
        </Button>
      </div>

      <ErrorAlert message={actionError} onDismiss={() => setActionError('')} />
      <ErrorAlert title="Could not load todos" message={error} onRetry={refresh} />

      {isFirstLoad ? <SkeletonList count={4} /> : null}

      {!isFirstLoad && todos.length === 0 ? (
        <EmptyState
          icon={hasFilters ? 'search' : 'todos'}
          title={hasFilters ? 'No todos match these filters' : 'No todos yet'}
          message={
            hasFilters
              ? 'Try a different search term or reset the filters.'
              : 'Add your first todo and it will appear here right away.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" icon="refresh" onClick={resetFilters}>
                Reset filters
              </Button>
            ) : (
              <Button icon="plus" onClick={openCreateForm}>
                Add a todo
              </Button>
            )
          }
        />
      ) : null}

      {todos.length > 0 ? (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id}>
              <TodoCard
                todo={todo}
                onToggle={handleToggle}
                onEdit={openEditForm}
                onDelete={(target) => {
                  setDeleteError('');
                  setDeleteTarget(target);
                }}
                busy={togglingId === todo.id}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <Modal
        open={formState.open}
        title={formState.mode === 'edit' ? 'Edit todo' : 'Add a new todo'}
        onClose={closeForm}
      >
        <TodoForm
          mode={formState.mode}
          initialValues={formState.todo ?? {}}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          submitting={saving}
          serverError={formError}
        />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete this todo?"
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      >
        <p>
          <strong>{deleteTarget?.title}</strong> will be removed permanently. This action cannot
          be undone.
        </p>

        {deleteError ? (
          <p className="form__error" role="alert">
            {deleteError}
          </p>
        ) : null}

        <div className="form__actions">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Keep it
          </Button>
          <Button variant="danger" icon="trash" onClick={handleConfirmDelete} loading={deleting}>
            Delete todo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
