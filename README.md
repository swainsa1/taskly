# Taskly

> A clean, polished homework & task tracker for kids — inspired by any.do

**Multi-user · Mobile-friendly · FastAPI + React + Turso**

---

## Quick Start (local dev)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd taskly

# 2. Start everything (SQLite file used automatically)
./start.sh
```

Open **http://localhost:5173**

- Students → Register at `/register`, manage tasks
- Admin → login `admin` / `adminpassword` (change in `backend/.env`), visit `/admin`
- API docs → http://localhost:3001/docs (Swagger UI, auto-generated)

---

## Deploy to Vercel (monorepo)

This repo contains two separate Vercel projects:

| Project | Root dir | What it does |
|---------|----------|-------------|
| `taskly-backend` | `backend/` | FastAPI serverless API |
| `taskly-frontend` | `frontend/` | React SPA |

### Step 1 — Create a Turso database

```bash
# Install Turso CLI
brew install tursodatabase/tap/turso

# Login
turso auth login

# Create database
turso db create taskly

# Get your connection URL
turso db show taskly --url
# → libsql://taskly-yourorg.turso.io

# Create an auth token
turso db tokens create taskly
# → eyJhbGc...
```

### Step 2 — Deploy the backend

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import this repo, set **Root Directory** to `backend/`
3. Framework: **Other**
4. Add these **Environment Variables** in Vercel:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `libsql://taskly-yourorg.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJhbGc...` (your token) |
| `SESSION_SECRET` | any long random string |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | your secure password |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | (fill in after step 3) |

5. Deploy → note the backend URL e.g. `https://taskly-backend.vercel.app`

### Step 3 — Deploy the frontend

1. **Add New Project** → same repo, set **Root Directory** to `frontend/`
2. Framework: **Vite**
3. Add this **Environment Variable**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://taskly-backend.vercel.app` |

4. Deploy → note the frontend URL e.g. `https://taskly-frontend.vercel.app`

### Step 4 — Wire them together

Go back to the **backend** Vercel project → Settings → Environment Variables → update `FRONTEND_URL` to `https://taskly-frontend.vercel.app` → Redeploy.

---

## Local dev with Turso (optional)

If you want to test with Turso locally instead of the SQLite file:

```bash
# Edit backend/.env
DATABASE_URL=libsql://taskly-yourorg.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...

# Then run as normal
./start.sh
```

---

## Tech Stack

| Layer | Local | Production |
|-------|-------|-----------|
| Database | SQLite file | Turso (libSQL) |
| Backend | FastAPI + uvicorn | FastAPI + Mangum (serverless) |
| Frontend | Vite dev server | Vite build → Vercel CDN |
| Package mgr (BE) | uv | pip (via requirements.txt) |

---

## Project Structure

```
taskly/
├── start.sh              # One command to start everything
├── backend/
│   ├── main.py           # FastAPI app + lifespan
│   ├── database.py       # libsql-client (SQLite file or Turso)
│   ├── api/index.py      # Vercel serverless entry point (Mangum)
│   ├── vercel.json       # Vercel backend config
│   ├── requirements.txt  # For Vercel pip install
│   ├── pyproject.toml    # uv dependencies
│   ├── .env.example      # Copy to .env
│   ├── migrations/       # SQL files applied in order
│   ├── routers/          # auth, tasks, admin
│   ├── services/         # user_service, task_service
│   └── middleware/       # auth FastAPI deps
└── frontend/
    ├── vercel.json       # SPA routing for Vercel
    ├── vite.config.js    # Dev proxy: /api → localhost:3001
    └── src/
        ├── services/api.js   # VITE_API_URL aware fetch wrapper
        ├── contexts/         # AuthContext
        ├── hooks/            # useTasks (React Query)
        ├── components/       # UI components
        └── pages/            # LoginPage, DashboardPage, AdminPage
```

---

## Environment Variables

### `backend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Dev server port |
| `DATABASE_URL` | `file:./db/taskly.sqlite` | SQLite or Turso URL |
| `TURSO_AUTH_TOKEN` | *(empty)* | Turso token (not needed for local file) |
| `SESSION_SECRET` | *(change me!)* | Cookie signing key |
| `ADMIN_USERNAME` | `admin` | Initial admin username |
| `ADMIN_PASSWORD` | `adminpassword` | Initial admin password |
| `FRONTEND_URL` | *(empty)* | Production frontend URL (for CORS) |

### `frontend/.env` (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | *(empty)* | Backend URL; empty = use Vite proxy |
