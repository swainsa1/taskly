# Implementation Plan: Taskly — Multi-User Task Tracker

**Branch**: `001-task-tracker-multi-user` | **Date**: 2026-05-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-task-tracker-multi-user/spec.md`

## Summary

Taskly is a full-stack web application for managing tasks across multiple users (students /
kids) with a clean, any.do-inspired UI. Users create tasks with a description (max 120 chars)
and optional due date, view them in four time-scoped tabs (Today, This Week, This Month, All),
and mark them complete. Admins can create, complete, and delete tasks for any user, and filter
an overview dashboard by user. Data persists in a file-based SQLite database.

**Tech stack** (from research.md): Node.js 20+ LTS, Express.js 4 (backend), React 18 + Vite
(frontend), better-sqlite3, express-session + connect-sqlite3, bcryptjs, Tailwind CSS v3.

## Technical Context

**Language/Version**: Node.js 20 LTS (backend), React 18 / Vite 5 (frontend)
**Primary Dependencies**: Express 4, better-sqlite3, express-session, connect-sqlite3, bcryptjs (backend); React 18, Vite 5, Tailwind CSS 3, React Query (frontend)
**Storage**: SQLite via better-sqlite3; file at `backend/db/taskly.sqlite`
**Testing**: Jest + Supertest (backend integration); Vitest + React Testing Library (frontend)
**Target Platform**: Web browser — phone (375 px+), tablet (768 px+), desktop; no native app
**Project Type**: Web application (backend REST API + React SPA frontend)
**Performance Goals**: Tab filter response < 1 second; page load < 3 seconds on 4G
**Constraints**: 375 px minimum width; ≤ 30 users; ≤ 500 tasks/user; no external DB server
**Scale/Scope**: Household / classroom scale; ~30 users, ~15k tasks total maximum

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Web-First, Full-Stack Architecture | ✅ PASS | Express backend + React frontend; strict API boundary; no SQL in frontend |
| II. SQLite as Single Source of Truth | ✅ PASS | better-sqlite3, file-based; versioned migration scripts; auto-applied on startup |
| III. Test-First Development | ✅ PASS | Tests written before implementation; Jest + Supertest + Vitest; integration tests per user story |
| IV. API Contract Integrity | ✅ PASS | REST API documented in contracts/api.md before implementation; versioned at /api/v1/ |
| V. Simplicity & YAGNI | ✅ PASS | No ORM, no GraphQL, no Redis, no queue; minimal dependency set; two tables |

**Post-Phase-1 re-check**: ✅ All principles pass. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-tracker-multi-user/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── api.md           ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── db/
│   │   ├── migrate.js            ← migration runner (auto-runs on startup)
│   │   └── migrations/
│   │       ├── 001_create_schema_migrations.sql
│   │       ├── 002_create_users.sql
│   │       └── 003_create_tasks.sql
│   ├── middleware/
│   │   ├── requireAuth.js        ← 401 if no session
│   │   └── requireAdmin.js       ← 403 if role != admin
│   ├── routes/
│   │   ├── auth.js               ← /api/v1/auth/*
│   │   ├── tasks.js              ← /api/v1/tasks/*
│   │   └── admin.js              ← /api/v1/admin/*
│   ├── services/
│   │   ├── taskService.js        ← date-window filtering logic
│   │   └── userService.js        ← password hashing, user lookup
│   └── app.js                    ← Express setup, session, routes
├── tests/
│   └── integration/
│       ├── auth.test.js
│       ├── tasks.test.js
│       └── admin.test.js
├── db/
│   └── taskly.sqlite             ← gitignored
├── .env.example
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── TaskCard/             ← single task row (description, due, status, complete btn)
│   │   ├── TaskList/             ← ordered list with open-first, closed-bottom sorting
│   │   ├── TabBar/               ← Today / This Week / This Month / All tabs
│   │   ├── AddTaskForm/          ← description input (120 char counter) + date picker
│   │   ├── AdminDashboard/       ← user selector + task table + action buttons
│   │   └── Auth/
│   │       ├── LoginForm/
│   │       └── RegisterForm/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx     ← personal task view (TabBar + TaskList + AddTaskForm)
│   │   └── AdminPage.jsx
│   ├── services/
│   │   └── api.js                ← fetch wrappers for all /api/v1/* endpoints
│   ├── hooks/
│   │   └── useTasks.js           ← React Query hook for task fetching/mutation
│   ├── App.jsx                   ← router, auth context
│   └── main.jsx
├── tests/
│   └── components/
│       ├── TaskCard.test.jsx
│       ├── AddTaskForm.test.jsx
│       └── AdminDashboard.test.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

**Structure Decision**: Option 2 — Web application with separate `backend/` and `frontend/`
directories at the repository root. The backend is a Node/Express JSON API; the frontend is
a React SPA built with Vite. In development, Vite proxies `/api` to `localhost:3001`
eliminating CORS issues. In production, Express serves the built frontend from `frontend/dist/`
via a static middleware, making a single deployable Node process.

## Complexity Tracking

> No violations — no entries required.
