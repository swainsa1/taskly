---

description: "Task list template for feature implementation"
---

# Tasks: Taskly — Multi-User Task Tracker

**Input**: Design documents from `/specs/001-task-tracker-multi-user/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅

**Tests**: Integration tests are included per user story (backend: Jest + Supertest; frontend: Vitest + RTL).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.
Authentication (US4) is implemented before US1–US3 despite being listed P4 in the spec, because it is a
blocking prerequisite for all other stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared state dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- File paths are exact per plan.md project structure

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize both projects, install dependencies, configure tooling.

- [ ] T001 Initialize backend project: create `backend/package.json` with dependencies (express, better-sqlite3, express-session, connect-sqlite3, bcryptjs, cors, dotenv) and scripts (start, dev, migrate, test, lint)
- [ ] T002 [P] Initialize frontend project via Vite in `frontend/`: install dependencies (react, react-dom, react-router-dom, @tanstack/react-query, autoprefixer, tailwindcss, postcss)
- [ ] T003 [P] Configure Tailwind CSS in `frontend/tailwind.config.js` and `frontend/src/index.css` (content paths, base styles, Taskly design tokens: primary colour #E84040, background #FAFAFA, spacing scale)
- [ ] T004 [P] Create `backend/.env.example` with PORT=3001, DB_PATH, SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
- [ ] T005 [P] Create root-level `package.json` with dev script that starts both servers concurrently (`npm run dev` in backend + frontend)
- [ ] T006 [P] Create `.gitignore` covering `node_modules/`, `*.sqlite`, `.env`, `frontend/dist/`, `backend/db/*.sqlite`
- [ ] T055 [P] Configure ESLint + Prettier in `backend/` and `frontend/`: create `.eslintrc.cjs` and `.prettierrc` in each; add `lint` npm script (`eslint src/` for backend, `eslint src/` for frontend); verify `npm run lint` passes in both packages
- [ ] T056 [P] Configure Vite dev proxy in `frontend/vite.config.js`: proxy `/api` → `http://localhost:3001` to eliminate CORS in development (CRITICAL — needed from Phase 3 onward when frontend calls API)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, Express skeleton, session handling, auth middleware. MUST be complete before any user story work begins.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [ ] T007 Create SQLite migration runner in `backend/src/db/migrate.js` (reads files from `backend/src/db/migrations/` in filename order, tracks applied in `schema_migrations` table, auto-runs on app startup)
- [ ] T008 [P] Write `backend/src/db/migrations/001_create_schema_migrations.sql` (CREATE TABLE schema_migrations with filename PK and applied_at)
- [ ] T009 [P] Write `backend/src/db/migrations/002_create_users.sql` (CREATE TABLE users: id, username UNIQUE, display_name, password_hash, role CHECK IN('user','admin') DEFAULT 'user', created_at per data-model.md)
- [ ] T010 [P] Write `backend/src/db/migrations/003_create_tasks.sql` (CREATE TABLE tasks: id, owner_id FK→users, description CHECK(length≤120), due_date NULL, status CHECK IN('open','closed') DEFAULT 'open', created_at; indexes on owner_id, due_date, status per data-model.md)
- [ ] T011 Configure Express app in `backend/src/app.js`: JSON body parsing, cookie-session via connect-sqlite3, CORS for dev, mount routes, run migrations on startup, seed admin account from ADMIN_USERNAME/ADMIN_PASSWORD env vars if no admin exists
- [ ] T012 [P] Implement `backend/src/middleware/requireAuth.js`: return 401 `{ error: 'unauthenticated' }` if `req.session.userId` is absent
- [ ] T013 [P] Implement `backend/src/middleware/requireAdmin.js`: call requireAuth then return 403 `{ error: 'forbidden' }` if session role ≠ 'admin'

**Checkpoint**: Run `npm run migrate` in backend — all 3 migrations applied, admin account seeded, `taskly.sqlite` created.

---

## Phase 3: US4 — User Registration & Login (Implementation prerequisite for all stories)

**Goal**: Users can register, log in, and log out. Frontend routes protect authenticated pages.

**Independent Test**: Register as `alice`, log in, confirm redirect to dashboard. Register as `bob`, confirm alice's session is not shared. Log out, confirm redirect to login page.

### Backend — Authentication API (Test-First: Red → Green)

- [ ] T017 [US4] **[RED]** Write backend auth integration tests in `backend/tests/integration/auth.test.js` FIRST (all tests must fail): register success, duplicate username 409, login success, login wrong password 401, GET /me authenticated, GET /me unauthenticated 401, logout clears session
- [ ] T014 [US4] **[GREEN]** Implement `backend/src/services/userService.js`: findByUsername (case-insensitive), createUser (hash password with bcryptjs, insert into users), verifyPassword (bcrypt compare)
- [ ] T015 [US4] **[GREEN]** Implement auth routes in `backend/src/routes/auth.js`: POST /register (validate, create user, set session), POST /login (verify, set session with userId + role), POST /logout (destroy session), GET /me (return session user) — per contracts/api.md
- [ ] T016 [US4] **[GREEN]** Mount auth router at `/api/v1/auth` in `backend/src/app.js` — run T017 tests again, all must pass

### Frontend — Auth UI

- [ ] T018 [P] [US4] Create API service in `frontend/src/services/api.js`: fetch wrappers for all auth endpoints (register, login, logout, me) and task endpoints — handles JSON, passes cookies, throws on non-2xx
- [ ] T019 [P] [US4] Create `frontend/src/contexts/AuthContext.jsx`: useAuth hook exposing { user, login, logout, register, isLoading }; calls GET /api/v1/auth/me on mount to restore session
- [ ] T020 [US4] Create `frontend/src/components/Auth/LoginForm.jsx`: username + password fields, submit calls login(), shows validation errors inline
- [ ] T021 [US4] Create `frontend/src/components/Auth/RegisterForm.jsx`: username, display_name, password fields, submit calls register(), shows validation errors and 409 username-taken error
- [ ] T022 [US4] Create `frontend/src/pages/LoginPage.jsx`: renders LoginForm, redirects to /dashboard on success, link to RegisterPage
- [ ] T023 [US4] Create `frontend/src/pages/RegisterPage.jsx`: renders RegisterForm, redirects to /dashboard on success, link to LoginPage
- [ ] T024 [US4] Set up React Router in `frontend/src/App.jsx`: routes for /, /login, /register, /dashboard (protected), /admin (protected + admin-only); unauthenticated access redirects to /login; wrap app in AuthContext provider and QueryClientProvider

**Checkpoint**: `npm run dev` — visit http://localhost:5173, register a new user, log in, confirm redirect to (empty) dashboard, log out.

---

## Phase 4: US1 — Add & View My Tasks (Priority: P1) 🎯 MVP

**Goal**: Logged-in users can create tasks (description + optional due date) and see them listed. Tasks can be marked complete (sink to bottom, struck-through). Data persists across reloads.

**Independent Test**: Log in as alice. Add "Math homework" due today, "Science project" due next week, "Book report" with no due date. Confirm all three appear. Mark "Math homework" done — confirm it moves to bottom of list, struck-through. Refresh — confirm state unchanged.

### Backend — Task CRUD API (Test-First: Red → Green)

- [ ] T028 [US1] **[RED]** Write backend tasks integration tests in `backend/tests/integration/tasks.test.js` FIRST (all tests must fail): create task success, create task missing description 400, create task description >120 chars 400, list tasks returns own tasks only, mark complete success, mark complete wrong user 403
- [ ] T025 [US1] **[GREEN]** Implement `backend/src/services/taskService.js`: getTasksForUser(userId, filter='all') — for now returns all tasks for user ordered open first by due_date ASC nulls last, then closed by due_date ASC nulls last; createTask(userId, description, dueDate); markTaskComplete(taskId, userId)
- [ ] T026 [US1] **[GREEN]** Implement user task routes in `backend/src/routes/tasks.js`: GET /api/v1/tasks?filter (pass filter to taskService, default 'all'), POST /api/v1/tasks (validate description 1–120 chars, optional due_date YYYY-MM-DD), PATCH /api/v1/tasks/:id/complete (verify ownership, 403 if not owner) — per contracts/api.md
- [ ] T027 [US1] **[GREEN]** Mount tasks router at `/api/v1/tasks` behind requireAuth in `backend/src/app.js` — run T028 tests again, all must pass

### Frontend — Dashboard UI

- [ ] T029 [P] [US1] Create `frontend/src/components/TaskCard/TaskCard.jsx`: displays description, due date (formatted), completion checkbox/button; open tasks rendered normally; closed tasks rendered struck-through and dimmed; overdue indicator prop (unused until US2)
- [ ] T030 [P] [US1] Create `frontend/src/components/AddTaskForm/AddTaskForm.jsx`: text input with live 120-character counter (red when at limit), date picker input, submit button; shows inline validation error if description empty or over limit; calls onSubmit(description, dueDate) prop
- [ ] T031 [US1] Create `frontend/src/components/TaskList/TaskList.jsx`: renders list of TaskCard components in order (open tasks first by due_date ASC nulls last, closed tasks below); renders empty-state slot (message passed as prop)
- [ ] T032 [US1] Create `frontend/src/hooks/useTasks.js`: React Query hook — useTasksQuery(filter) for GET /api/v1/tasks?filter, useCreateTask() mutation (POST), useCompleteTask() mutation (PATCH /:id/complete); all invalidate tasks query on success
- [ ] T033 [US1] Create `frontend/src/pages/DashboardPage.jsx`: header with display_name + logout; AddTaskForm (calls useCreateTask); TaskList wired to useTasksQuery('all'); empty-state message "No tasks yet — add one above!"
- [ ] T034 [US1] Add /dashboard route pointing to DashboardPage in `frontend/src/App.jsx` (already scaffolded in T024 — confirm wiring is complete)

**Checkpoint**: Register, log in, add three tasks, mark one done, refresh — all state persists. Test at 375px browser width.

---

## Phase 5: US2 — Time-Scoped Task Views (Priority: P2)

**Goal**: Dashboard shows four tabs — Today, This Week, This Month, All — each filtering tasks by due date. Overdue open tasks highlighted in Today tab.

**Independent Test**: With tasks due today, this week, next month, and no due date — each tab shows exactly the right subset. Overdue task appears highlighted in Today tab. Switch between tabs in under 1 second. Verify on 375px phone width.

### Backend — Date Filtering (Test-First: Red → Green)

- [ ] T036 [US2] **[RED]** Add date-filter integration tests to `backend/tests/integration/tasks.test.js` FIRST (must fail): today filter returns overdue open + today's tasks, week filter, month filter, all filter includes no-due-date tasks; tasks without due date absent from today/week/month
- [ ] T035 [US2] **[GREEN]** Extend `backend/src/services/taskService.js` getTasksForUser to handle filter param: 'today' = open tasks with due_date ≤ today OR closed tasks with due_date = today; 'week' = due_date in current Mon–Sun; 'month' = due_date in current calendar month; 'all' = no date filter; use ISO date string comparisons (YYYY-MM-DD) against server timezone boundaries — run T036 tests, all must pass

### Frontend — Tab UI

- [ ] T037 [P] [US2] Create `frontend/src/components/TabBar/TabBar.jsx`: four tabs (Today / This Week / This Month / All); active tab highlighted; touch-friendly tap targets (min 44px height); horizontally scrollable on narrow phones; calls onTabChange(filter) prop
- [ ] T038 [US2] Update `frontend/src/pages/DashboardPage.jsx`: add TabBar above TaskList; active filter state drives useTasksQuery(filter); tab switch triggers refetch; pass filter-appropriate empty-state messages to TaskList (e.g., "Nothing due today — you're all caught up!", "No tasks this week", "No tasks this month", "No tasks yet — add one above!")
- [ ] T039 [US2] Update `frontend/src/components/TaskCard/TaskCard.jsx`: add overdue highlighting — when task status is 'open' and due_date < today, apply red/warning colour to due date label and card border

**Checkpoint**: Create tasks across multiple time windows. Confirm each tab shows exactly correct tasks. Overdue task highlighted. Tab switch < 1 second. Verify at 375px width.

---

## Phase 6: US3 — Admin Dashboard (Priority: P3)

**Goal**: Admin users can view all users' tasks (filtered by user), create tasks for any user, mark any task complete, and delete any task.

**Independent Test**: Log in as admin. View all tasks — see tasks from multiple users. Filter to alice — see only alice's tasks. Add a task for alice. Mark one of bob's tasks complete. Delete a task — confirm gone from both admin and user view.

### Backend — Admin API (Test-First: Red → Green)

- [ ] T042 [US3] **[RED]** Write backend admin integration tests in `backend/tests/integration/admin.test.js` FIRST (all must fail): list users, get all tasks multi-user, filter by userId, create task for user (appears in user's list), mark complete, delete task (gone from user's list), non-admin gets 403
- [ ] T040 [US3] **[GREEN]** Implement admin routes in `backend/src/routes/admin.js`: GET /users (list all users); GET /tasks?userId&filter (fetch tasks across all or one user, each with owner {id, display_name}, ordered by due_date ASC nulls last then display_name ASC); POST /tasks (create task for owner_id, validate owner exists); PATCH /tasks/:id/complete; DELETE /tasks/:id — all per contracts/api.md
- [ ] T041 [US3] **[GREEN]** Mount admin router at `/api/v1/admin` behind requireAdmin in `backend/src/app.js` — run T042 tests, all must pass

### Frontend — Admin UI

- [ ] T043 [P] [US3] Create `frontend/src/components/AdminDashboard/UserSelector.jsx`: dropdown/select showing "All Users" plus each registered user by display_name; calls onUserChange(userId | 'all') prop; fetches user list from GET /api/v1/admin/users on mount
- [ ] T044 [P] [US3] Create `frontend/src/components/AdminDashboard/AdminTaskRow.jsx`: displays owner display_name, description, due date (or "No due date"), status badge; Complete button (disabled if already closed); Delete button with brief confirmation (e.g., confirm on second click or simple confirm dialog); calls onComplete(id) and onDelete(id) props
- [ ] T045 [US3] Create `frontend/src/components/AdminDashboard/AddTaskForUserForm.jsx`: description input with 120-char counter, date picker, user selector (pre-filled with currently selected user); submit calls POST /api/v1/admin/tasks
- [ ] T046 [US3] Create `frontend/src/components/AdminDashboard/AdminDashboard.jsx`: UserSelector + AddTaskForUserForm + list of AdminTaskRow; fetches from GET /api/v1/admin/tasks?userId&filter=all; complete and delete actions call respective admin endpoints and invalidate query; empty-state message when no tasks
- [ ] T047 [US3] Create `frontend/src/pages/AdminPage.jsx`: renders AdminDashboard; nav link back to personal dashboard; confirm admin role via AuthContext (redirect to /dashboard if not admin)
- [ ] T048 [US3] Confirm /admin route in `frontend/src/App.jsx` is wired to AdminPage with admin-role guard (already scaffolded in T024 — verify guard logic is correct)

**Checkpoint**: Log in as admin. Complete admin golden path from quickstart.md §6.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive fixes, navigation chrome, production build wiring, and end-to-end validation.

- [ ] T049 [P] Audit and fix responsive layout at 375px across all pages: DashboardPage, LoginPage, RegisterPage, AdminPage — ensure no horizontal overflow, all touch targets ≥ 44px, tab bar scrolls correctly, forms usable on small screens
- [ ] T050 [P] Create `frontend/src/components/Header/Header.jsx`: app logo/name "Taskly", logged-in user's display_name, logout button, "Admin" link (visible only when role = 'admin'); integrate into DashboardPage and AdminPage
- [ ] T052 Configure Express in `backend/src/app.js` to serve `frontend/dist/` as static files in production (when NODE_ENV=production), with SPA fallback (`*` → index.html)
- [ ] T053 Add `npm run build` script to root package.json that runs `npm run build` in frontend then starts backend
- [ ] T054 Run quickstart.md end-to-end validation: golden path student flow (§5), admin flow (§6), access control check (§7), full test suite (§8) — all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002–T006 can all run in parallel with T001
- **Foundational (Phase 2)**: Depends on Phase 1 complete — BLOCKS all user stories; T008–T010, T012–T013 can run in parallel within phase
- **US4 Auth (Phase 3)**: Depends on Foundational complete — BLOCKS US1, US2, US3; backend tasks (T014–T017) before frontend tasks (T018–T024)
- **US1 Tasks (Phase 4)**: Depends on US4 complete — backend (T025–T028) before frontend (T029–T034); T029–T030 can run in parallel
- **US2 Tab Views (Phase 5)**: Depends on US1 complete — extends existing service and UI
- **US3 Admin (Phase 6)**: Depends on US4 complete — independent of US2; can start in parallel with US2 if team capacity allows
- **Polish (Phase 7)**: Depends on all user story phases complete; T049–T051 can run in parallel

### User Story Dependencies

- **US4 (Auth)**: Foundational phase complete
- **US1 (Tasks)**: US4 complete (login required to test)
- **US2 (Tab Views)**: US1 complete (extends task service and dashboard)
- **US3 (Admin)**: US4 complete, US1 complete (needs tasks to exist; admin routes independent of US2)

### Within Each Phase

- Backend service → backend routes → backend tests
- Frontend service (api.js) → frontend hooks → frontend components → frontend pages
- Mark story complete before moving to next

### Parallel Opportunities

- T002–T006 (Phase 1 setup): All in parallel after T001
- T008–T010, T012–T013 (Phase 2): In parallel
- T018–T019 (Phase 3 frontend infra): In parallel with each other
- T029–T030 (Phase 4 components): In parallel
- T037 (Phase 5 TabBar): In parallel with T035–T036
- T043–T045 (Phase 6 admin components): T043 + T044 in parallel; T045 after T043
- T049–T051 (Phase 7 polish): All in parallel

---

## Implementation Strategy

### MVP First (US1 Only — Phases 1–4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (migrations, middleware)
3. Complete Phase 3: US4 Auth (register/login)
4. Complete Phase 4: US1 Tasks (create + view + mark complete)
5. **STOP and VALIDATE**: Register, add tasks, mark done, confirm persistence at 375px
6. Demo-able: single user can track their own tasks

### Incremental Delivery

1. Setup + Foundational → infrastructure ready
2. US4 Auth → users can register and log in
3. US1 Tasks → users can create and manage tasks (MVP!)
4. US2 Tab Views → users can filter by Today / Week / Month / All
5. US3 Admin → admins can oversee and manage all users' tasks
6. Polish → production-ready, phone-optimised

### Parallel Team Strategy

With two developers after Foundational is complete:

- Developer A: US4 Auth → US1 Tasks → US2 Tab Views (sequential, each depends on prior)
- Developer B: US4 Auth → US3 Admin (can branch off after auth is done)

---

## Notes

- `[P]` tasks = different files, no incomplete-task dependencies — safe to parallelise
- `[USn]` label maps each task to its user story for traceability
- Each user story is independently completable and testable
- Backend integration tests MUST be written in the same phase as the routes they test
- Commit after each phase checkpoint passes
- Test at 375px width at each phase checkpoint (not just final polish)
- Avoid: tasks that modify the same file without explicit ordering, cross-story dependencies that break independence
