# TaskNest · Todos & Notes Dashboard

A full-stack Todo List and Notes dashboard built with **React**, **Node.js**,
**Express**, **Vitest** and **Supertest**.

TaskNest keeps everything you need to run a day in one clean, light dashboard:
create and prioritise todos with due dates, tick them off, search and filter the
list, keep short notes on pastel cards, and see the numbers that matter on the
overview page.

> **In-memory data:** this version intentionally has **no database**. Todos and
> notes are stored in the Express process, so **all data resets when the backend
> server restarts**. The data layer is isolated behind repository modules so a
> real database (PostgreSQL, MongoDB, ...) can be added later without rewriting
> the API or the frontend.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [UI reference](#ui-reference)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Running the backend](#running-the-backend)
- [Running the frontend](#running-the-frontend)
- [Running both together](#running-both-together)
- [Running the tests](#running-the-tests)
- [API endpoints](#api-endpoints)
- [Data management approach](#data-management-approach)
- [Current limitations](#current-limitations)
- [Future improvements](#future-improvements)

---

## Features

**Todos**

- Create, read, update and delete todos.
- Mark todos as completed and back to pending with an accessible checkbox.
- Completed todos are visually distinct: filled checkbox, struck-through title
  and reduced emphasis.
- Priorities (**Low**, **Medium**, **High**) shown as coloured pills.
- Optional due dates with friendly labels ("Today", "Tomorrow", "3 days late")
  and overdue highlighting.
- Server-side **search** across the title and description.
- Server-side **filters**: All, Pending, Completed, Low / Medium / High priority,
  plus sorting by created date, due date, priority or title.
- "Clear completed" removes every finished todo in one action.
- Filter chips show live counts for each status.

**Notes**

- Create, read, update and delete notes (title + free-form content).
- Notes render as tinted cards with a bullet preview of their content.
- Search notes by title or content.

**Dashboard**

- Quick-add box: type a task and it appears on your todo list immediately.
- Statistic cards: total todos, pending, completed, high priority and notes.
- Completion percentage, "due today" and overdue counters.
- Recent todos and latest notes, with links to the full pages.

**Engineering**

- Layered backend: routes → middleware → controllers → services → repositories.
- One shared error shape and correct HTTP status codes for every failure.
- Reusable React components, custom hooks and design tokens.
- Fully responsive (desktop sidebar → tablet → mobile off-canvas drawer).
- Accessible forms, buttons, dialogs and focus handling.
- 90+ automated tests with Vitest and Supertest.

---

## Tech stack

| Area             | Choice                                                     |
| ---------------- | ---------------------------------------------------------- |
| Language         | JavaScript (ES modules)                                    |
| Frontend         | React 19, React Router 7, Vite                             |
| Styling          | Plain CSS with design tokens (no framework)                |
| Backend          | Node.js, Express 5                                         |
| API              | REST / JSON                                                |
| Data             | In-memory repositories (no database in this version)       |
| Tests            | Vitest + Supertest (API), Vitest (client utilities)        |
| Tooling          | npm workspaces, `concurrently`, `node --watch`             |

---

## UI reference

The interface was designed from the visual reference in
[`docs/ui-reference.png`](docs/ui-reference.png): a light dashboard with a deep
navy sidebar, indigo accents, a lavender gradient quick-add panel, soft-bordered
cards and pastel note cards.

The implementation is an original design inspired by that reference - no text or
sample data from it was copied.

Add your own screenshots to `docs/` and link them here, for example:

```markdown
![TaskNest dashboard](docs/screenshot-dashboard.png)
![TaskNest todos](docs/screenshot-todos.png)
```

---

## Project structure

```
.
├── client/                  React app (Vite)
│   └── src/
│       ├── components/      layout/, todos/, notes/, ui/ (reusable pieces)
│       ├── config/          navigation metadata
│       ├── hooks/           useTodos, useNotes, useDashboardStats, ...
│       ├── pages/           DashboardPage, TodosPage, NotesPage, NotFoundPage
│       ├── services/        apiClient + one module per resource
│       ├── styles/          tokens, base, layout, components, overlays, pages
│       ├── utils/           date formatting, priorities, form validation
│       ├── App.jsx
│       └── main.jsx
├── server/                  Express REST API
│   ├── config/              environment configuration
│   ├── controllers/         HTTP glue
│   ├── data/                memoryStore, seed data, repositories
│   ├── middleware/          validation, error handling, 404 handling
│   ├── routes/              route definitions
│   ├── services/            business rules (search, filter, sort, statistics)
│   ├── tests/               Vitest + Supertest suites
│   ├── utils/               AppError, ids, dates, priorities, clock
│   ├── validators/          reusable input validation
│   ├── app.js               Express app factory
│   └── server.js            entry point
├── docs/
│   └── ui-reference.png
├── AGENTS.md                instructions for AI coding agents
├── README.md
└── package.json             npm workspaces + top-level scripts
```

---

## Prerequisites

- **Node.js 18.11 or newer** (Node 20+ recommended - the server uses `--watch`
  and the client uses Vite 8). Check with `node --version`.
- **npm 9 or newer** (npm workspaces are used). Check with `npm --version`.

No database, Docker or global CLI is required.

---

## Installation

Install every workspace dependency with a single command from the repository
root:

```bash
npm install
```

That installs the root tooling, `server/` and `client/` dependencies.

---

## Environment variables

Everything works with the defaults, so **no `.env` file is required for local
development**. Copy the examples only if you want to change something.

**Server** - copy `server/.env.example` to `server/.env`:

| Variable        | Default       | Purpose                                                      |
| --------------- | ------------- | ------------------------------------------------------------ |
| `PORT`          | `5000`        | Port the Express API listens on                               |
| `NODE_ENV`      | `development` | `development` \| `test` \| `production`                       |
| `CLIENT_ORIGIN` | *(empty)*     | Comma separated allowed CORS origins; empty reflects the caller |
| `SEED_DATA`     | `true`        | Load the demo todos and notes on start                        |
| `JSON_LIMIT`    | `100kb`       | Maximum accepted JSON body size                               |

The server reads process environment variables directly, so you can also start it
with Node's built-in env file support:

```bash
node --env-file=.env server.js     # from inside the server/ folder
```

**Client** - copy `client/.env.example` to `client/.env`:

| Variable            | Default | Purpose                                            |
| ------------------- | ------- | -------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`  | API base URL; the default relies on the Vite proxy |
| `VITE_PROXY_TARGET` | `http://localhost:5000` | Where the dev server forwards `/api` |

---

## Running the backend

```bash
npm run dev:server        # from the repository root, restarts on file changes
# or
npm run start             # production style start without watching
```

The API runs at **http://localhost:5000/api** and prints a short banner with the
number of seeded records:

```
  TaskNest API is running
  URL           http://localhost:5000/api
  Health check  http://localhost:5000/api/health
  Environment   development
  Storage       in-memory  (6 todos, 4 notes)
  Note          in-memory data resets every time this server restarts
```

Quick check:

```bash
curl http://localhost:5000/api/health
```

---

## Running the frontend

Start the API first, then:

```bash
npm run dev:client
```

Open **http://localhost:5173**. The Vite dev server proxies every `/api` request
to `http://localhost:5000`, so there is no CORS setup to worry about in
development.

For a production bundle:

```bash
npm run build      # outputs client/dist
npm run preview    # serves the built bundle locally
```

In production Express can serve the built client itself (single-service
deployment): run `npm run build`, then start the API with
`NODE_ENV=production npm run start` and open **http://localhost:5000**. Any
non-`/api` route falls back to `index.html` so client side routing works.

---

## Running both together

```bash
npm run dev
```

This starts the API and the Vite dev server in one terminal with prefixed,
colour-coded output (`server` and `client`). Stop both with `Ctrl+C`.

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | API + client in watch mode                          |
| `npm run dev:server`| Express API with `node --watch`                     |
| `npm run dev:client`| Vite dev server                                     |
| `npm run start`     | Express API (no watch)                              |
| `npm run build`     | Production build of the React client                |
| `npm run preview`   | Serve the built client locally                      |
| `npm run test`      | All tests (server + client)                         |
| `npm run test:server` | Backend API tests (Vitest + Supertest)            |
| `npm run test:client` | Frontend utility tests (Vitest)                   |

---

## Running the tests

```bash
npm test                 # everything
npm run test:server      # 71 API tests (Vitest + Supertest)
npm run test:client      # 21 client utility tests (Vitest)
```

What the backend suite covers:

- **Todos:** list, create, read, update (`PUT`), partial update (`PATCH`),
  delete, clear completed.
- **Notes:** list, create, read, update, partial update, delete.
- **Dashboard:** statistics, priority breakdown, recent items, live recalculation.
- **Validation and errors:** missing/blank titles, invalid priority, invalid due
  date, non-boolean `completed`, malformed JSON, client supplied `id`, malformed
  id (400), unknown id (404), unknown route (404).
- **Search, filtering and sorting:** title/description search, status and
  priority filters, combined filters, sorting by priority, title and due date,
  plus list metadata counts.
- **Infrastructure:** health check and the shared error response shape.

Every test starts from a clean, predictable store (`resetData()` in
`beforeEach`), so tests are independent of each other and of seeded data.

---

## API endpoints

Base URL: `http://localhost:5000/api`

### Todos

| Method   | Endpoint               | Description                                                       |
| -------- | ---------------------- | ----------------------------------------------------------------- |
| `GET`    | `/todos`               | List todos with optional `search`, `status`, `priority`, `sort`, `order` |
| `GET`    | `/todos/:id`           | Get one todo                                                      |
| `POST`   | `/todos`               | Create a todo → `201`                                             |
| `PUT`    | `/todos/:id`           | Replace a todo (omitted optional fields return to their defaults) |
| `PATCH`  | `/todos/:id`           | Partially update a todo (also used to toggle completion)          |
| `DELETE` | `/todos/:id`           | Delete a todo                                                     |
| `DELETE` | `/todos/completed`     | Delete every completed todo                                       |

**Todo shape**

```json
{
  "id": "0f5c2e7a-1f5f-4a1f-9a4e-6e9a2f0f5d21",
  "title": "Ship the REST API",
  "description": "Add Supertest coverage for each route.",
  "completed": false,
  "priority": "high",
  "due_date": "2030-04-01T00:00:00.000Z",
  "created_at": "2026-09-29T09:15:04.120Z",
  "updated_at": "2026-09-29T09:15:04.120Z"
}
```

- `priority` accepts `low`, `medium`, `high` (default `medium`).
- `due_date` accepts an ISO date or date-time, or `null` for "no due date".
- `completed` must be a real boolean.
- `id`, `created_at` and `updated_at` are generated by the server; sending them
  returns `400`.

**Query parameters for `GET /todos`**

| Parameter  | Values                                                        | Default      |
| ---------- | ------------------------------------------------------------- | ------------ |
| `search`   | any text (matches title or description, case-insensitive)      | *(empty)*    |
| `status`   | `all`, `pending`, `completed`                                  | `all`        |
| `priority` | `all`, `low`, `medium`, `high`                                 | `all`        |
| `sort`     | `created_at`, `updated_at`, `due_date`, `priority`, `title`    | `created_at` |
| `order`    | `asc`, `desc`                                                  | `desc`       |

List responses include metadata for the filter chips:

```json
{
  "data": [ /* matching todos */ ],
  "meta": {
    "count": 1,
    "total": 7,
    "counts": { "all": 7, "pending": 5, "completed": 2, "low": 2, "medium": 2, "high": 3 },
    "filters": { "search": "api", "status": "all", "priority": "high", "sort": "created_at", "order": "desc" }
  }
}
```

Examples:

```bash
curl "http://localhost:5000/api/todos?search=report"
curl "http://localhost:5000/api/todos?status=completed"
curl "http://localhost:5000/api/todos?priority=high&sort=due_date&order=asc"
curl -X PATCH http://localhost:5000/api/todos/<id> \
  -H "Content-Type: application/json" -d '{"completed": true}'
```

### Notes

| Method   | Endpoint    | Description                                    |
| -------- | ----------- | ---------------------------------------------- |
| `GET`    | `/notes`    | List notes with optional `search`              |
| `GET`    | `/notes/:id`| Get one note                                   |
| `POST`   | `/notes`    | Create a note → `201`                          |
| `PUT`    | `/notes/:id`| Replace a note                                 |
| `PATCH`  | `/notes/:id`| Partially update a note                        |
| `DELETE` | `/notes/:id`| Delete a note                                  |

**Note shape**

```json
{
  "id": "b1b6a1c4-8e2f-4f1e-9c1a-3f7d2a6b0c11",
  "title": "Sprint planning",
  "content": "Scope the release\nReview the open pull requests",
  "created_at": "2026-09-29T09:16:22.480Z",
  "updated_at": "2026-09-29T09:16:22.480Z"
}
```

### Dashboard and health

| Method | Endpoint            | Description                            |
| ------ | ------------------- | -------------------------------------- |
| `GET`  | `/dashboard/stats`  | Aggregated statistics for the overview |
| `GET`  | `/health`           | Liveness check + in-memory record counts |

```json
{
  "data": {
    "todos": {
      "total": 7, "pending": 5, "completed": 2,
      "highPriority": 3, "highPriorityPending": 2,
      "overdue": 1, "dueToday": 1, "completionRate": 29
    },
    "notes": { "total": 4 },
    "priorityBreakdown": { "low": 2, "medium": 2, "high": 3 },
    "recentTodos": [ /* 5 newest todos */ ],
    "recentNotes": [ /* 3 most recently updated notes */ ],
    "generated_at": "2026-09-29T09:20:11.004Z"
  }
}
```

### Status codes and error shape

`200` success · `201` created · `400` invalid data · `404` missing resource or
unknown route · `500` unexpected server error.

```json
{ "error": { "message": "Title is required", "status": 400, "code": "VALIDATION_ERROR", "details": [ { "field": "title", "message": "Title is required" } ] } }
```

---

## Data management approach

There is **no database** in this version. The application data lives in memory
inside the Express process:

```
server/data/memoryStore.js      the only mutable state ({ todos: [], notes: [] })
server/data/todoRepository.js   async CRUD for todos  (returns clones)
server/data/noteRepository.js   async CRUD for notes  (returns clones)
server/data/seed.js             optional demo content, loaded when SEED_DATA=true
```

Why it is built this way:

- **Repositories are async and return copies.** Services already behave as if
  they were talking to a remote database, so replacing a repository with a
  PostgreSQL or MongoDB implementation will not require changes in services,
  controllers, routes, the API contract or the React client.
- **Nothing above `data/` touches the store.** Routes, controllers and services
  never import `memoryStore`, so the storage engine stays replaceable.
- **The server owns identity and time.** Ids (`crypto.randomUUID()`) and
  timestamps (a monotonic ISO clock) are always generated on the backend.
- **The API is the frontend's only source of truth.** React hooks fetch and
  mutate through `/api`; the frontend never keeps a hidden copy of the data.

`SEED_DATA=true` (the default) loads six demo todos and four demo notes so the
dashboard looks alive immediately. Set `SEED_DATA=false` to start empty. Either
way, **restarting the server resets everything**.

---

## Current limitations

- **No persistence.** Data is lost when the backend restarts or is redeployed.
- **Single user.** There is no authentication, accounts or per-user data.
- **Single process.** Because data lives in memory, running multiple server
  instances would give each instance its own dataset.
- **No pagination.** The API returns the full filtered collection; that is fine
  for hundreds of records but not for thousands.
- **No optimistic UI updates.** Lists refetch from the API after every mutation,
  which is simple and always correct but means a short round trip per action.
- **No rich text in notes.** Content is plain text (each line renders as a bullet
  on the card).
- **No notifications.** Overdue todos are highlighted, but there are no reminders
  or emails.
- **No lint/format configuration yet.** The code follows one consistent style by
  convention (see `AGENTS.md`).

---

## Future improvements

1. **Persistent storage** - implement the repositories with PostgreSQL
   (Prisma or Knex) or MongoDB, keeping the existing repository signatures.
2. **Authentication** - accounts, JWT sessions and per-user todos/notes.
3. **Pagination and infinite scroll** for the todo list.
4. **Optimistic updates** with rollback on failure, for instant feedback.
5. **Reminders and notifications** for due dates (browser notifications, email).
6. **Drag-and-drop ordering** and subtasks/projects for todos.
7. **Rich text or markdown notes** with checklists and tags.
8. **Dark mode**, driven by the existing design tokens.
9. **End-to-end tests** (Playwright) plus component tests with React Testing
   Library, building on the current unit and API test suites.
10. **CI pipeline** running `npm test` and `npm run build` on every push, with a
    Docker image for simple deployment.

---

## License

MIT - free to use, learn from and adapt.
