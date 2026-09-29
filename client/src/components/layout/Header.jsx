import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../ui/Icons.jsx';
import { APP_NAME, getPageMeta } from '../../config/navigation.js';
import { formatLongDate, formatTime, getGreeting } from '../../utils/formatDate.js';

/**
 * Top bar with the greeting, current page context, the date and a reminder that
 * the API keeps data in memory.
 */
export default function Header({ onOpenSidebar }) {
  const { pathname } = useLocation();
  const { title, description } = getPageMeta(pathname);
  const [now, setNow] = useState(() => new Date());

  // Keep the clock in the header reasonably fresh without re-rendering often.
  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(intervalId);
  }, []);

  // The document title follows the current page, which helps screen readers
  // and browser tabs identify where the user is.
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`;
  }, [title]);

  return (
    <header className="header">
      <div className="row">
        <button
          type="button"
          className="menu-button"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
          aria-controls="sidebar"
        >
          <Icon name="menu" size={22} />
        </button>

        <div className="header__titles">
          <h1 className="header__title">{getGreeting(now)} 👋</h1>
          <p className="header__subtitle">
            {title} · {description}
          </p>
        </div>
      </div>

      <div className="header__meta">
        <p className="header__date">
          <strong>{formatLongDate(now)}</strong>
          {formatTime(now)}
        </p>

        <span
          className="pill pill--subtle"
          title="Data is stored in the Express server's memory and resets when it restarts"
        >
          <Icon name="database" size={16} />
          In-memory demo
        </span>
      </div>
    </header>
  );
}
