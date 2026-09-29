import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TodosPage from './pages/TodosPage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * Application routes.
 *
 * Every page renders inside <AppLayout /> so the sidebar, header and responsive
 * behaviour are shared. The pages themselves only care about their own data.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
