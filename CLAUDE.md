# Taskly Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-09

## Active Technologies

- **Backend**: Python 3.11, FastAPI, uvicorn, SQLite (stdlib `sqlite3`), bcrypt, itsdangerous (sessions), python-dotenv — managed with **uv**
- **Frontend**: React 18, Vite 5 (dev server + proxy), Tailwind CSS 3, React Query (@tanstack/react-query), React Router v7

## Project Structure

```
taskly/
├── start.sh                  # ← run this to start everything
├── backend/                  # Python/FastAPI backend
│   ├── main.py               # App entry point, startup, seeding
│   ├── database.py           # SQLite init + migration runner
│   ├── pyproject.toml        # uv/Python dependencies
│   ├── .env.example          # Copy to .env and fill in secrets
│   ├── migrations/           # SQL migration files (run in filename order)
│   ├── routers/              # FastAPI routers (auth, tasks, admin)
│   ├── services/             # Business logic (user_service, task_service)
│   └── middleware/           # FastAPI dependency functions (auth guards)
├── frontend/                 # React/Vite frontend
│   ├── src/
│   │   ├── main.jsx          # Entry point (BrowserRouter, QueryClient, AuthProvider)
│   │   ├── App.jsx           # Route definitions + auth guards
│   │   ├── contexts/         # AuthContext
│   │   ├── services/         # api.js (fetch wrappers)
│   │   ├── hooks/            # useTasks.js (React Query hooks)
│   │   ├── components/       # UI components
│   │   └── pages/            # Page-level components
│   ├── tailwind.config.js    # Design tokens (primary: #E84040, surface: #FAFAFA)
│   └── vite.config.js        # Dev proxy: /api → localhost:3001
└── specs/001-task-tracker-multi-user/  # Feature specs, contracts, tasks
```

## Commands

### Start everything
```bash
./start.sh
```

### Backend (Python/uv)
```bash
cd backend
uv sync                                          # install dependencies
uv run uvicorn main:app --reload --port 3001     # dev server
uv run pytest                                    # tests
```

### Frontend (Node/npm)
```bash
cd frontend
npm install        # install dependencies
npm run dev        # Vite dev server (port 5173)
npm run build      # production build → dist/
npm run lint       # ESLint
```

## Design Tokens (any.do inspired)

| Token | Value | Usage |
|-------|-------|-------|
| `primary-500` | `#E84040` | Buttons, active tabs, brand |
| `surface` | `#FAFAFA` | Page background |
| `card` | `#FFFFFF` | Task cards |
| `muted` | `#6B7280` | Secondary text |
| `border` | `#E5E7EB` | Subtle dividers |

## API Contract

All endpoints under `/api/v1/`. Session cookie: `taskly_session`.

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/v1/auth/register` | — | Create account |
| `POST /api/v1/auth/login` | — | Login |
| `POST /api/v1/auth/logout` | user | Logout |
| `GET /api/v1/auth/me` | user | Session info |
| `GET /api/v1/tasks?filter=` | user | List own tasks |
| `POST /api/v1/tasks` | user | Create task |
| `PATCH /api/v1/tasks/:id/complete` | user | Mark done |
| `GET /api/v1/admin/users` | admin | List users |
| `GET /api/v1/admin/tasks` | admin | All tasks |
| `POST /api/v1/admin/tasks` | admin | Create for user |
| `PATCH /api/v1/admin/tasks/:id/complete` | admin | Complete any |
| `DELETE /api/v1/admin/tasks/:id` | admin | Delete any |

## Code Style

- **Python**: follow PEP 8; use type hints; FastAPI dependency injection for auth guards
- **JavaScript/JSX**: single quotes, trailing commas (ES5), 100 char line width
- **CSS**: Tailwind utility classes; custom components in `index.css` `@layer components`

## Recent Changes

- 2026-05-09: Switched backend from Node.js/Express to Python/FastAPI (uv) to avoid native module compilation issues with Node.js 26
