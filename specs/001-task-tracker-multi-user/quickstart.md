# Taskly — Quickstart Guide

**Branch**: `001-task-tracker-multi-user`

This guide validates that the implementation is working end-to-end. Run through these steps in order after completing each implementation phase to confirm the golden path.

---

## Prerequisites

- Node.js 20+ and npm installed
- Repository cloned and on branch `001-task-tracker-multi-user`

---

## 1. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## 2. Configure Environment

```bash
# backend/.env (create if not present)
PORT=3001
DB_PATH=./db/taskly.sqlite
SESSION_SECRET=dev-secret-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
```

---

## 3. Run Database Migrations

```bash
cd backend
npm run migrate
# Expected: "Applied migration: 001_create_schema_migrations.sql"
#           "Applied migration: 002_create_users.sql"
#           "Applied migration: 003_create_tasks.sql"
#           "Admin account seeded: admin"
```

---

## 4. Start the Servers

```bash
# Terminal 1 — backend
cd backend && npm run dev
# Expected: "Taskly backend listening on http://localhost:3001"

# Terminal 2 — frontend
cd frontend && npm run dev
# Expected: "VITE ready at http://localhost:5173"
```

---

## 5. Golden Path: Student User

Open `http://localhost:5173` in a browser (test on desktop and on a phone or device-emulation at 375 px width).

**Register**:
1. Click **Sign up**
2. Enter username `alice`, display name `Alice`, password `password123`
3. Confirm redirect to personal dashboard

**Create tasks**:
1. Click **+ Add task**
2. Enter description `"Math homework chapter 5"` and set due date to today → Submit
3. Confirm task appears in **Today** tab
4. Add `"Science project"` with due date next week → confirm in **This Week** tab
5. Add `"Book report"` with no due date → confirm only in **All** tab

**Mark complete**:
1. Click the completion button on **Math homework chapter 5**
2. Confirm it moves to the bottom of the Today tab, struck-through or dimmed
3. Refresh the page — confirm state persists

---

## 6. Golden Path: Admin User

1. Log out (`alice`)
2. Log in as `admin` / `changeme`
3. Navigate to **Admin** view
4. Confirm Alice's tasks appear with her display name, description, due date, status
5. Use the user selector to filter to Alice only — confirm only her tasks show
6. Create a new task for Alice: description `"History quiz"`, due tomorrow
7. Log out, log back in as Alice — confirm `"History quiz"` appears
8. Back as admin: mark Alice's `"Science project"` as complete
9. Delete `"History quiz"` — confirm it disappears from Alice's dashboard

---

## 7. Access Control Check

1. Log in as a second student (`bob`) registered via the sign-up page
2. Note Alice's task IDs from the URL (or API)
3. Attempt `GET /api/v1/tasks` — confirm only Bob's tasks are returned
4. Attempt `PATCH /api/v1/tasks/<alice_task_id>/complete` — confirm `403 Forbidden`

---

## 8. Run the Test Suite

```bash
# Backend integration tests
cd backend && npm test

# Frontend component tests
cd frontend && npm test
```

All tests MUST pass before the implementation is considered complete.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|-------------|
| `SQLITE_CANTOPEN` on startup | `DB_PATH` directory doesn't exist; create `backend/db/` |
| Session not persisting | `SESSION_SECRET` mismatch between restarts; use a stable secret |
| `401` on all API calls | Cookie not sent; check frontend is proxying `/api` to port 3001 |
| Admin account missing | Set `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars and re-run `npm run migrate` |
