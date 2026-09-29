import { useEffect, useId, useRef } from 'react';
import Icon from './Icons.jsx';

/**
 * Accessible modal dialog.
 *
 * - `role="dialog"` with `aria-modal` and a labelled heading
 * - Escape closes it and clicking the backdrop closes it
 * - focus moves into the dialog on open and returns to the trigger on close
 * - the page behind it is locked from scrolling while open
 */
export default function Modal({ open, title, onClose, children, footer }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('no-scroll');

    const dialog = dialogRef.current;
    const focusTarget =
      dialog?.querySelector('[data-autofocus]') ??
      dialog?.querySelector('input, textarea, select') ??
      dialog?.querySelector('button');
    focusTarget?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('no-scroll');
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef}>
        <header className="modal__header">
          <h2 className="modal__title" id={titleId}>
            {title}
          </h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon-only"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
