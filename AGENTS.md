# AGENTS.md

Instructions for AI coding agents working on **TaskNest** (a Todo List and Notes
web application). Read this file before changing anything in the repository.

---

# Project Overview

TaskNest is a full-stack Todo and Notes dashboard.

- Users can create, read, update and delete **todos** (title, description,
  priority, due date, completed) and **notes** (title, content).
- Todos support **search** (title + description), **filtering** (status and
  priority), **sorting** and completion toggling.
- A **dashboard** shows aggregate statistics (totals, pending, completed, high
  priority, notes, overdue, due today).
- The React client talks to an Express REST API. **The API is the single source
  of truth for application data.**
- **There is no database in this version.** Data lives in memory in the Express
  process and resets when the server restarts. This is intentional.

---

# Technology Stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Frontend   | JavaScript (ES modules), React 19, React Router 7, Vite           |
| Styling    | Plain CSS with design tokens (no CSS framework, no CSS-in-JS)      |
| Backend    | Node.js, Express 5, ES modules                                    |
| API        | REST over JSON                                                    |
| Data       | In-memory JavaScript arrays behind repository modules             |
| Tests      | Vitest + Supertest (API), Vitest (client utilities)               |
| Tooling    | npm workspaces, `concurrently`, `node --watch`                    |

Rules:

- **Do not add dependencies without a clear need.** No HTTP client libraries,
  no state management library, no icon library, no validation library, no ORM.
  `fetch`, React state and the existing helpers are enough.
- Do not add a database, Docker setup or bundler change unless the user
  explicitly asks for it.

---

# Architecture

The backend is layered so that each layer has exactly one reason to change:

```
HTTP request
  -> routes/*.js            route definitions + middleware wiring only
  -> middleware/validate.js validates and normalises into req.validated
  -> controllers/*.js       HTTP glue: read req.validated, call a service, send JSON
  -> services/*.js          business rules: filtering, sorting, searching, statistics
  -> data/*Repository.js    data access (async, returns cloned records)
  -> data/memoryStore.js    the only mutable state in the process
```

Cross-cutting helpers live in `utils/` (errors, ids, dates, priorities, clock)
and `validators/` (pure field and payload validators).

The frontend is layered as:

```
pages/*.jsx                 screen composition + user intent
  -> hooks/use*.js          fetch/mutate state, loading and error handling
  -> services/*Api.js       endpoint wrappers (one function per request)
  -> services/apiClient.js  the only place that calls fetch()
```

Components never call `fetch`, never build URLs and never own application data.

**Why this matters:** replacing `server/data/*Repository.js` with MongoDB or
PostgreSQL implementations must be possible without touching services,
controllers, routes, the API contract or the frontend.

---

# Folder Structure

```
.
├── client/                       React application (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           AppLayout, Sidebar, Header
│   │   │   ├── todos/            TodoCard, TodoForm, TodoFilterBar
│   │   │   ├── notes/            NoteCard, NoteForm
│   │   │   └── ui/               Button, Modal, StatsCard, EmptyState, Icons, ...
│   │   ├── config/               navigation metadata
│   │   ├── hooks/                useTodos, useNotes, useDashboardStats, useDebouncedValue, useAsyncAction
│   │   ├── pages/                DashboardPage, TodosPage, NotesPage, NotFoundPage
│   │   ├── services/             apiClient, todosApi, notesApi, dashboardApi, queryString
│   │   ├── styles/               tokens, base, layout, components, overlays, pages
│   │   ├── utils/                formatDate, priority, formValidation
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                       Express REST API
│   ├── config/                   environment configuration
│   ├── controllers/              todoController, noteController, dashboardController
│   ├── data/                     memoryStore, seed, todoRepository, noteRepository
│   ├── middleware/               validate, errorHandler, notFoundHandler
│   ├── routes/                   index, todoRoutes, noteRoutes, dashboardRoutes
│   ├── services/                 todoService, noteService, dashboardService
│   ├── tests/                    todos.test.js, notes.test.js, dashboard.test.js,
│   │                             infrastructure.test.js, helpers/
│   ├── utils/                    AppError, idGenerator, priority, dates, clock, text, asyncHandler
│   ├── validators/               fields, todoValidator, noteValidator
│   ├── app.js                    builds the Express app
│   ├── server.js                 entry point (listen + graceful shutdown)
│   └── vitest.config.js
├── docs/                         ui-reference.png and any added screenshots
├── AGENTS.md
├── README.md
└── package.json                  npm workspaces + top level scripts
```

Add files to the layer they belong to. Do not create parallel structures (for
example a second `api/` folder, or data logic inside a component).

---

# Coding Standards

- JavaScript only, ES modules (`import` / `export`). No TypeScript, no CommonJS.
- Use `const` / `let`, never `var`. Prefer pure functions and early returns.
- File names: `camelCase.js` for modules, `PascalCase.jsx` for React components,
  `*.test.js` for tests.
- Keep functions small and give them descriptive names (`validateDueDate`,
  `buildQueryString`, `getDashboardStats`).
- Add a short comment that explains **why** a non-obvious piece of code exists.
  Do not comment code that already reads clearly.
- Keep the existing JSDoc style on exported helpers; it is the documentation for
  anyone reading the file for the first time.
- Avoid dead code. If you remove the last usage of a helper, remove the helper
  and its tests in the same change.
- Match the formatting already in the file (2 space indentation, single quotes,
  semicolons, trailing commas in multi-line literals).
- Keep the code beginner friendly: explicit names, no clever one-liners, no
  deep nesting.

---

# React Rules

- Function components with hooks only. No class components.
- **The API is the source of truth.** Never seed application data from a
  hard-coded array in the frontend and never treat local state as the database.
  Local state is only for UI concerns (open modal, current filter input, form
  values).
- Data loading and mutations belong in `src/hooks/*` (through `services/*Api.js`).
  Components render props and call handlers.
- Use reusable components from `src/components/ui/` (Button, Modal, StatsCard,
  EmptyState, ErrorAlert, Icon) instead of one-off markup. Add a new reusable
  component only when something is used in more than one place or clearly
  belongs together.
- Do not create a component for every element; a component should have a clear
  single responsibility.
- Every list gets a stable `key` (use the record `id`).
- Show loading, empty and error states for every data-driven view.
- Guard optional callbacks (`onEdit?.(note)`) or do not render the action
  control at all when no handler is provided (see `NoteCard`).
- Use `aria-label` on icon-only buttons, `<label htmlFor>` on every input, and
  `role="alert"` for errors.
- Never use `dangerouslySetInnerHTML`.

---

# Backend Rules

- Route files only declare routes and middleware. No business logic, no data
  access, no validation rules inline.
- Controllers only translate HTTP: read from `req.validated`, call one service
  function, send a JSON response with an explicit status code.
- Services contain the business rules and throw `AppError` for expected
  failures (`AppError.badRequest`, `AppError.notFound`). Wrap handlers in
  `asyncHandler` so rejections reach the error middleware.
- **Never import `memoryStore` outside `data/`.** Services talk to repositories.
- Timestamps come from `utils/clock.js` (`nowIso()`), never from
  `new Date().toISOString()` inside a service or controller.
- Use `utils/priority.js`, `utils/dates.js` and `utils/text.js` for shared logic
  instead of duplicating rules.
- Keep one error response shape for everything: the Express error handler is the
  only place that formats errors.

---

# API Rules

Base path: `/api`. Successful responses use `data` (plus `meta` for lists).
Errors always look like:

```json
{ "error": { "message": "...", "status": 400, "code": "VALIDATION_ERROR", "details": [] } }
```

Endpoints:

| Method | Path                   | Purpose                                                     |
| ------ | ---------------------- | ----------------------------------------------------------- |
| GET    | `/api/health`          | Liveness check + in-memory record counts                    |
| GET    | `/api/todos`           | List todos (`search`, `status`, `priority`, `sort`, `order`) |
| POST   | `/api/todos`           | Create a todo (201)                                         |
| GET    | `/api/todos/:id`       | Read one todo                                               |
| PUT    | `/api/todos/:id`       | Replace a todo (defaults applied to omitted fields)         |
| PATCH  | `/api/todos/:id`       | Partially update (also used to toggle completion)           |
| DELETE | `/api/todos/:id`       | Delete a todo                                               |
| DELETE | `/api/todos/completed` | Remove every completed todo                                 |
| GET    | `/api/notes`           | List notes (`search`)                                       |
| POST   | `/api/notes`           | Create a note (201)                                         |
| GET    | `/api/notes/:id`       | Read one note                                               |
| PUT    | `/api/notes/:id`       | Replace a note                                              |
| PATCH  | `/api/notes/:id`       | Partially update a note                                     |
| DELETE | `/api/notes/:id`       | Delete a note                                               |
| GET    | `/api/dashboard/stats` | Aggregated statistics for the dashboard                     |

Status codes:

- `200` success, `201` created.
- `400` invalid payload or query, malformed JSON, malformed id.
- `404` well formed id that does not exist, or an unknown route.
- `500` unexpected failure (the message stays generic in production).

Conventions:

- Validate all input through `validators/` before it reaches a service.
- Reject server-owned fields (`id`, `created_at`, `updated_at`) with 400.
- Never rename or remove an existing response field; the frontend depends on the
  contract. Additive changes are fine and must be documented here and in the
  README.
- `PUT` replaces (omitted optional fields revert to defaults), `PATCH` merges.
  Keep this behaviour identical for todos and notes.

---

# Data Management Rules

- In-memory only. **Do not introduce a database** unless the user explicitly
  asks for it.
- All state lives in `server/data/memoryStore.js`. Repositories are the only
  modules allowed to touch it.
- Repositories are `async`, return **clones** (never live references) and never
  expose the internal arrays.
- Repositories own ids (`utils/idGenerator.js`) and timestamps
  (`utils/clock.js`); clients can never set them.
- `resetStore({ seed })` is the only way to clear or seed state:
  `resetStore()` gives an empty store, `resetStore({ seed: true })` loads the
  demo data.
- **Keep the data layer replaceable.** A new implementation must keep the same
  function signatures (`findAll`, `findById`, `create`, `update`, `remove`,
  `removeWhere`) so services do not change when a database is added later.
- Seed/demo content belongs in `server/data/seed.js`. Write your own sample
  text; do not copy content from `docs/ui-reference.png`.

---

# Testing Rules

- Run `npm test` (both workspaces) or `npm run test:server` /
  `npm run test:client` after any change to API behaviour.
- Backend tests live in `server/tests/` and use **Vitest + Supertest** against
  the exported Express app (`createApp()`); never start a real listener.
- Always call `resetData()` in `beforeEach`. Tests must start from a predictable
  state and must **not** depend on the order they run in or on seeded data.
- For every API change cover: success path, invalid input (400), missing record
  (404), status codes, response structure and search/filter/sort behaviour.
- Use `tests/helpers/testContext.js` (`api`, `resetData`, `createTodoFixture`,
  `createNoteFixture`, `UNKNOWN_ID`, `MALFORMED_ID`) instead of repeating setup.
- Client tests cover pure logic (utils, form validation, query building). They
  must not depend on the network or on a fixed date; derive dates relative to
  today exactly as the existing tests do.
- **Never delete or skip a failing test to make the suite green.** Fix the code,
  or fix the expectation and explain why the original one was wrong.
- Keep assertions specific (`expect(response.status).toBe(201)`), not loose.

---

# UI/UX Rules

- Follow the visual language established from `docs/ui-reference.png`: a light
  `#f4f5fb` canvas, white cards with soft borders and shadows, 8–16px radii, a
  deep navy sidebar (`#1a1d2e`) with an indigo (`#4f46e5`) active item, a
  lavender gradient hero panel, pastel note cards and coloured priority pills.
  The UI is **inspired by** the reference; its text and sample data must never
  be copied.
- Use the tokens in `src/styles/tokens.css`. Do not hard-code colours, spacing,
  radii or shadows in components.
- Keep the existing class naming (`block__element--modifier`). Add new CSS to the
  file for the layer it belongs to (`layout.css`, `components.css`,
  `overlays.css`, `pages.css`).
- **Responsive is required.** Desktop shows the fixed sidebar; below 980px the
  sidebar becomes an off-canvas drawer with a backdrop and a hamburger button in
  the header; below 640px cards stack and forms/buttons go full width. Check
  desktop, tablet and mobile widths after layout changes.
- **Accessibility is required.** A label for every field, `aria-pressed` on
  toggle buttons, `aria-live` for changing counts, `visually-hidden` text for
  context, visible focus rings, keyboard support (Escape closes modals, focus
  returns to the trigger) and sufficient colour contrast.
- Completed todos must always stay visually distinct (checked box,
  strikethrough title, reduced emphasis).
- Users must never lose feedback: show API errors inline, keep loading states,
  and confirm destructive actions in a modal.
- Prefer the existing components and spacing rhythm over inventing new patterns.

---

# Security Rules

- Keep the essentials intact: `app.disable('x-powered-by')` and the JSON body
  size limit (`JSON_LIMIT`).
- Never trust client input: validate on the backend even when the frontend
  already validated it, and never build a record from the raw request body.
- Never let a client set `id`, `created_at` or `updated_at`.
- Limit CORS to the configured origins (`CLIENT_ORIGIN`) in production. Do not
  switch a deployed environment to `origin: '*'`.
- Never commit secrets. Use `.env.example` to document variables; real `.env`
  files are git-ignored.
- Do not log full request bodies or secrets, and keep error messages generic in
  production (already handled in `middleware/errorHandler.js`).
- Never render unsanitised HTML in React (`dangerouslySetInnerHTML` is banned).
- Do not silently add authentication; it is out of scope for this version. If it
  is requested, agree on the approach first.

---

# Agent Workflow

1. **Understand before changing.** Read this file, the README, the relevant
   route/controller/service/repository and the tests for the area you touch.
2. **Respect the modes.** Only edit files in act mode. In plan mode, propose the
   change instead of making it.
3. **Stay in scope.** Change the smallest set of files that solves the task. Do
   not reformat, rename or "improve" unrelated files.
4. **Preserve existing behaviour.** Every current endpoint, response field and UI
   feature must keep working. Adding an endpoint or field is fine; removing one
   is a breaking change that must be explicitly requested.
5. **Follow the established patterns** for validation, error handling, in-memory
   data access and styling instead of inventing a new approach.
6. **Write tests when API behaviour changes**, and update the tests that describe
   behaviour you intentionally changed.
7. **Run the checks** before finishing:
   - `npm run test:server`
   - `npm run test:client`
   - `npm run build` (make sure the client still compiles)
   - optionally `npm run dev` and click through the affected screens.
8. **Keep the docs in sync.** Update `README.md` when endpoints, scripts,
   environment variables or features change, and update this file when the
   architecture or conventions change.
9. **Report clearly.** Summarise which files changed and why, what you ran, and
   any limitation that remains.

Never:

- Add a database, ORM or migrations "for later".
- Move data logic into routes, React components or the frontend.
- Delete failing tests instead of fixing them.
- Commit `node_modules`, `dist` or `.env` files.
- Break the API response contract or the responsive/accessible behaviour.
