import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState.jsx';
import Icon from '../components/ui/Icons.jsx';

/**
 * Fallback page for unknown routes.
 * The action is a link styled as a button (a button inside a link would be
 * invalid markup and confusing for keyboard users).
 */
export default function NotFoundPage() {
  return (
    <EmptyState
      icon="alert"
      title="This page does not exist"
      message="The link may be outdated. Head back to the dashboard to keep working."
      action={
        <Link to="/" className="btn btn--primary btn--md">
          <Icon name="dashboard" size={18} />
          Back to dashboard
        </Link>
      }
    />
  );
}
