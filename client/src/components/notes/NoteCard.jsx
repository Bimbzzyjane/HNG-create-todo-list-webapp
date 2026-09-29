import Button from '../ui/Button.jsx';
import { formatDateTime } from '../../utils/formatDate.js';
import { getNotePreviewLines, getNoteTone } from '../../utils/priority.js';

/**
 * Note card with a pastel tint, a short bullet preview and edit/delete actions.
 * The tint is derived from the note id so it stays stable between renders.
 */
export default function NoteCard({ note, index = 0, onEdit, onDelete, busy = false }) {
  const tone = getNoteTone(note, index);
  const previewLines = getNotePreviewLines(note.content);

  return (
    <article className={`note-card note-card--${tone}`}>
      <header className="note-card__header">
        <h3 className="note-card__title">{note.title}</h3>
        <p className="note-card__timestamp">{formatDateTime(note.updated_at)}</p>
      </header>

      {previewLines.length > 0 ? (
        <ul className="note-card__lines">
          {previewLines.map((line, lineIndex) => (
            <li key={`${note.id}-line-${lineIndex}`}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="note-card__empty">No content yet</p>
      )}

      {onEdit || onDelete ? (
        <footer className="note-card__actions">
          {onEdit ? (
            <Button
              variant="ghost"
              size="sm"
              icon="pencil"
              onClick={() => onEdit(note)}
              aria-label={`Edit note "${note.title}"`}
              disabled={busy}
            />
          ) : null}
          {onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              icon="trash"
              onClick={() => onDelete(note)}
              aria-label={`Delete note "${note.title}"`}
              disabled={busy}
            />
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
