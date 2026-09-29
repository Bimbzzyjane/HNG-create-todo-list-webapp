import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icons.jsx';
import { APP_NAME, NAV_ITEMS } from '../../config/navigation.js';

/**
 * Sidebar navigation.
 * Fixed on desktop, an off-canvas drawer below 980px (see styles/layout.css).
 */
export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      id="sidebar"
      className={isOpen ? 'sidebar is-open' : 'sidebar'}
      aria-label="Main navigation"
    >
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          <Icon name="checkSquare" size={22} />
        </span>
        <span>{APP_NAME}</span>
        <button
          type="button"
          className="sidebar__close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
          >
            <Icon name={item.icon} size={20} className="nav-link__icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <Icon name="database" size={22} />
        <strong>{APP_NAME} stores data in memory</strong>
        Todos and notes live in the Express server while it runs, so they reset
        whenever the API restarts.
      </div>
    </aside>
  );
}
