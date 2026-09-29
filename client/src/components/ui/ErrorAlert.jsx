import Icon from './Icons.jsx';
import Button from './Button.jsx';

/**
 * Inline error message.
 * `role="alert"` makes screen readers announce it as soon as it appears.
 */
export default function ErrorAlert({ title = 'Something went wrong', message, onDismiss, onRetry }) {
  if (!message) return null;

  return (
    <div className="alert alert--error" role="alert">
      <Icon name="alert" size={20} className="alert__icon" />
      <div className="alert__content">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <div className="alert__actions">
        {onRetry ? (
          <Button variant="ghost" size="sm" icon="refresh" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
        {onDismiss ? (
          <Button variant="ghost" size="sm" icon="close" onClick={onDismiss} aria-label="Dismiss message" />
        ) : null}
      </div>
    </div>
  );
}
