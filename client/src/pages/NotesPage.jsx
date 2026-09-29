import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import Icon from '../components/ui/Icons.jsx';
import Modal from '../components/ui/Modal.jsx';
import { SkeletonList } from '../components/ui/Skeleton.jsx';
import NoteCard from '../components/notes/NoteCard.jsx';
import NoteForm from '../components/notes/NoteForm.jsx';
import { useNotes } from '../hooks/useNotes.js';
import { getErrorMessage } from '../services/apiClient.js';

const CLOSED_FORM = { open: false, mode: 'create', note: null };

/**
 * Notes page: a responsive grid of pastel note cards with search and CRUD.
 */
export default function NotesPage() {
  const [search, setSearch] = useState('');
  const { notes, meta, loading, error, refresh, createNote, updateNote, deleteNote } = useNotes({
    search,
  });

  const [formState, setFormState] = useState(CLOSED_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isFirstLoad = loading && notes.length === 0;

  function openCreateForm() {
    setFormError('');
    setFormState({ open: true, mode: 'create', note: null });
  }

  function openEditForm(note) {
    setFormError('');
    setFormState({ open: true, mode: 'edit', note });
  }

  function closeForm() {
    if (saving) return;
    setFormError('');
    setFormState(CLOSED_FORM);
  }

  async function handleFormSubmit(payload) {
    setSaving(true);
    setFormError('');

    try {
      if (formState.mode === 'edit' && formState.note) {
        await updateNote(formState.note.id, payload);
      } else {
        await createNote(payload);
      }
      setFormState(CLOSED_FORM);
    } catch (submitError) {
      setFormError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await deleteNote(deleteTarget.id);
      setDeleteTarget(null);
    } catch (deleteFailure) {
      setDeleteError(getErrorMessage(deleteFailure));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="stack">
      <section className="toolbar" aria-label="Search and manage notes">
        <div className="filter-bar__search">
          <label className="visually-hidden" htmlFor="note-search">
            Search notes by title or content
          </label>
          <Icon name="search" size={18} className="filter-bar__search-icon" />
          <input
            id="note-search"
            type="search"
            className="input filter-bar__search-input"
            value={search}
            placeholder="Search notes..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="row row--between row--wrap">
          <p className="text-subtle" aria-live="polite">
            {loading && !isFirstLoad
              ? 'Refreshing notes...'
              : `Showing ${meta?.count ?? 0} of ${meta?.total ?? 0} notes`}
          </p>
          <Button icon="plus" onClick={openCreateForm}>
            New note
          </Button>
        </div>
      </section>

      <ErrorAlert title="Could not load notes" message={error} onRetry={refresh} />

      {isFirstLoad ? <SkeletonList count={3} /> : null}

      {!isFirstLoad && notes.length === 0 ? (
        <EmptyState
          icon={search ? 'search' : 'notes'}
          title={search ? 'No notes match your search' : 'No notes yet'}
          message={
            search
              ? 'Try another keyword, or clear the search to see every note.'
              : 'Notes are a good place for checklists, ideas and reminders.'
          }
          action={
            search ? (
              <Button variant="secondary" icon="refresh" onClick={() => setSearch('')}>
                Clear search
              </Button>
            ) : (
              <Button icon="plus" onClick={openCreateForm}>
                Write a note
              </Button>
            )
          }
        />
      ) : null}

      {notes.length > 0 ? (
        <div className="notes-grid">
          {notes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              onEdit={openEditForm}
              onDelete={(target) => {
                setDeleteError('');
                setDeleteTarget(target);
              }}
            />
          ))}
        </div>
      ) : null}

      <Modal
        open={formState.open}
        title={formState.mode === 'edit' ? 'Edit note' : 'Write a new note'}
        onClose={closeForm}
      >
        <NoteForm
          mode={formState.mode}
          initialValues={formState.note ?? {}}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          submitting={saving}
          serverError={formError}
        />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete this note?"
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
            Delete note
          </Button>
        </div>
      </Modal>
    </div>
  );
}
