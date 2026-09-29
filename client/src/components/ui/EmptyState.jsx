import Icon from './Icons.jsx';

/**
 * Empty state shown when a list has no items (or no matches).
 * `action` can be any node, usually a <Button />.
 */
export default function EmptyState({ icon = 'sparkle', title, message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="empty-state__title">{title}</h3>
      {message ? <p className="empty-state__message">{message}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
