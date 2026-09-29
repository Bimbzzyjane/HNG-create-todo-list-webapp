import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

/**
 * Application shell shared by every page: sidebar, header and the main content
 * area. It also owns the mobile navigation state.
 */
export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Navigating always closes the mobile drawer.
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prevent the page behind the drawer from scrolling on small screens.
  useEffect(() => {
    document.body.classList.toggle('no-scroll', isSidebarOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [isSidebarOpen]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div className="app-main">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="page" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
