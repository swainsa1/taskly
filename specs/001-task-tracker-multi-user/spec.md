# Feature Specification: Taskly

**Feature Branch**: `001-task-tracker-multi-user`
**Created**: 2026-05-09
**Status**: Draft
**Input**: User description: "lets build a task management application where i can add a task by entering a short description and selecting a due date. multiple users are allowed. One is the User view where the users are allowed to see what tasks are due today, Weekly, Monthly in multiple tabs, another tab could anytime. Now in the admin view i should be able to see all the users task and due date. This would be a kids homework tracker so clean and polished look. I want to persist it using a lightweight database something like sqlite stored in the file. The users (students/kids) are allowed to add tasks and mark them closed, see different views for their tasks by looking at daily/weekly/monthly/alltime view. Admin users are able to select all or each of the users and see their tasks. Keep it generic so admin can also use it as task management users. Like the functionality of any.do which is clean polished and simple."

## Clarifications

### Session 2026-05-09

- Q: Is full phone (small-screen) support required in v1? → A: Yes — phone support is required in v1.
- Q: What is the design aesthetic goal? → A: Minimal, uncluttered UI; clean and polished (any.do-style).
- Q: What is the application name? → A: Taskly.
- Q: Can admins modify student tasks, or is the admin dashboard read-only? → A: Full control — admins can create, mark complete, and delete tasks for any user.
- Q: How should tasks be ordered within each tab? → A: Due date ascending (soonest first); tasks without a due date appear at the bottom.
- Q: Where do completed tasks appear — mixed in, hidden, or separated? → A: Completed tasks sink to the bottom of the current tab, visually struck-through or dimmed.
- Q: Should task descriptions have a maximum character limit? → A: Yes — 120 characters maximum.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add & View My Tasks (Priority: P1)

A student (or any regular user) opens Taskly, logs in, and lands on their personal task dashboard. They can add a new task by typing a short description and picking a due date from a date picker. The task immediately appears in the correct tab (Today, This Week, This Month, or All). They can mark any task as complete and it is visually distinguished from open tasks. The interface is clean and uncluttered on both phone and desktop.

**Why this priority**: This is the core value of Taskly. Without the ability to create and view tasks, nothing else in the app is useful. Every other story builds on this foundation.

**Independent Test**: A single user can register, log in, create three tasks with different due dates on a phone browser, see each appear in the correct time-scoped tab, mark one as done, and confirm the done state persists after a page refresh.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on their dashboard (on any device — phone, tablet, or desktop), **When** they enter a description and select a due date and submit, **Then** the new task appears in the appropriate tab (Today / This Week / This Month / All) immediately without a full page reload.
2. **Given** an open task exists, **When** the user marks it as complete, **Then** it is immediately visually marked done and the count of open tasks in that tab updates.
3. **Given** tasks across multiple time windows exist, **When** the user switches between Today / This Week / This Month / All tabs, **Then** only tasks whose due date falls within that window are shown.
4. **Given** the user closes the browser and reopens it, **When** they log back in, **Then** all previously created tasks and their completion state are unchanged.

---

### User Story 2 - Time-Scoped Task Views (Priority: P2)

A user wants to understand at a glance what needs attention now versus later. The Taskly dashboard offers four tabs — **Today**, **This Week**, **This Month**, and **All** — each filtering tasks by due date relative to the current day. Overdue tasks (past due date, still open) are highlighted to draw attention in the Today tab. On phone screens the tab bar is touch-friendly and the task list scrolls cleanly without visual clutter.

**Why this priority**: The tabbed time-scoped view is the primary differentiator of Taskly. It helps kids prioritise homework at a glance, matching the any.do-style UX the user referenced.

**Independent Test**: Create tasks due today, this week, next month, with no due date. Confirm each appears exclusively in the correct tab(s) and that "All" shows every task regardless of date. Confirm overdue tasks are highlighted. Repeat on a phone-width browser window.

**Acceptance Scenarios**:

1. **Given** tasks with due dates spanning today, this week, this month, and beyond, **When** the user views the Today tab, **Then** only tasks due on today's date (or overdue and still open) are shown.
2. **Given** the same task set, **When** the user views This Week, **Then** tasks due within the current calendar week (Monday–Sunday) are shown, including today's tasks.
3. **Given** the same task set, **When** the user views This Month, **Then** tasks due within the current calendar month are shown.
4. **Given** an open task whose due date has already passed, **When** it appears in the Today tab, **Then** it is visually highlighted as overdue (e.g., red or warning colour).
5. **Given** the All tab is active, **When** the user views it, **Then** every task they own (open and closed, with or without due date) is listed.

---

### User Story 3 - Admin Dashboard: Full Control Over All Users' Tasks (Priority: P3)

An admin user logs in and sees a dedicated admin dashboard. They can view all tasks across every user, or filter down to a single user's tasks. Each task row shows the user's display name, task description, due date, and status (open / closed). Admins can create tasks on behalf of any user, mark any user's task as complete, and permanently delete any task. Admins also retain full access to the personal task dashboard to manage their own tasks.

**Why this priority**: Admin full control is essential for parents and teachers who may need to manage homework entries for younger students. It depends on users having tasks (Story 1) and is independent of Story 2's tab filters.

**Independent Test**: With two student accounts each having tasks, an admin can view the combined list, add a new task for a specific student, mark one of that student's tasks as complete, delete another task, and filter to just one student — all confirmed to persist correctly.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they open the admin dashboard, **Then** they see tasks from all registered users, each showing: user name, description, due date, and status.
2. **Given** the admin dashboard is open, **When** the admin selects a specific user from the user selector, **Then** only that user's tasks are displayed.
3. **Given** the admin dashboard is open, **When** the admin selects "All Users", **Then** tasks from every user are shown, sorted by due date ascending (tasks without a due date appear last).
4. **Given** the admin dashboard is open for a selected user, **When** the admin creates a new task for that user, **Then** the task is saved under that user's account and appears in their personal dashboard.
5. **Given** a task in the admin dashboard, **When** the admin marks it as complete, **Then** it is immediately updated to closed status for the owning user.
6. **Given** a task in the admin dashboard, **When** the admin deletes it, **Then** it is permanently removed and no longer visible to the owning user.
7. **Given** an admin account, **When** they navigate to the personal task view, **Then** they can create and manage their own tasks using the same interface as a regular user.

---

### User Story 4 - User Account Registration & Login (Priority: P4)

Visitors can register a new Taskly account using a display name and a password. Registered users can log in and out. A regular user cannot access another user's tasks. At least one admin account exists from initial setup.

**Why this priority**: Authentication is foundational but is isolated as its own story because the login/register flow can be built and verified independently before any task features are wired up.

**Independent Test**: Register two users, log in as each separately, confirm the tasks created by User A are not visible when logged in as User B, and that User B cannot access User A's task list by manipulating the URL.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they register with a unique username and a password, **Then** an account is created and they are redirected to their personal task dashboard.
2. **Given** a registered user, **When** they log in with correct credentials, **Then** they are taken to their personal task dashboard.
3. **Given** a logged-in regular user, **When** they attempt to view another user's tasks (e.g., via URL manipulation), **Then** access is denied and they see an error or are redirected.
4. **Given** an admin, **When** they open a user list view, **Then** they see all registered usernames.

---

### Edge Cases

- What happens when a user submits a task with no description, or a description exceeding 120 characters? → The form rejects the submission with a clear inline validation message; no invalid task is stored. A live character counter is shown as the user types.
- What happens when no due date is selected? → The task is created without a due date and appears only in the All tab; it is not shown in Today / This Week / This Month.
- What if two tasks have the same description and due date? → Both are stored as separate tasks; duplicates are permitted.
- What if a tab has no tasks to show? → An encouraging empty-state message is shown (e.g., "Nothing due today — you're all caught up!").
- What if an admin logs in for the first time with no users or tasks? → The admin dashboard shows an empty state with a message indicating no users or tasks yet.
- What if the phone screen is very narrow (< 375 px)? → The app targets 375 px as the minimum supported width; narrower devices may have degraded but functional layout.
- What happens when an admin deletes a task? → The deletion is immediate and permanent; the task disappears from both the admin dashboard and the owning user's dashboard. There is no undo in v1.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A visitor MUST be able to register a new Taskly account with a unique username and a password.
- **FR-002**: A registered user MUST be able to log in with their username and password and be directed to their personal task dashboard.
- **FR-003**: A logged-in user MUST be able to create a task by providing a text description (required, maximum 120 characters) and an optional due date.
- **FR-004**: A logged-in user MUST be able to view their tasks filtered into four tabs: Today, This Week, This Month, and All.
- **FR-005**: The Today tab MUST include tasks due on the current date AND overdue open tasks (past due date, not yet completed).
- **FR-006**: Overdue open tasks MUST be visually distinguished from on-time tasks in the Today tab.
- **FR-007**: Tasks without a due date MUST appear only in the All tab and not in Today / This Week / This Month.
- **FR-008**: A logged-in user MUST be able to mark any of their open tasks as complete; the change MUST be reflected immediately in the UI.
- **FR-009**: All task data and completion states MUST persist across browser sessions (page reload, close and reopen).
- **FR-010**: An admin user MUST have access to a dedicated admin dashboard showing tasks from all registered users.
- **FR-011**: The admin dashboard MUST allow the admin to filter tasks by selecting a specific user or all users.
- **FR-012**: Each task row in the admin dashboard MUST display: the owning user's display name, task description, due date (or "No due date"), and status (open / closed).
- **FR-013**: An admin MUST be able to create a new task assigned to any specific user from the admin dashboard.
- **FR-014**: An admin MUST be able to mark any user's task as complete from the admin dashboard.
- **FR-015**: An admin MUST be able to permanently delete any user's task from the admin dashboard.
- **FR-016**: An admin user MUST also be able to use the personal task dashboard to manage their own tasks.
- **FR-017**: A regular user MUST NOT be able to view or modify another user's tasks.
- **FR-018**: All application data MUST be stored in a file-based SQLite database requiring no external database server.
- **FR-019**: The application MUST be fully usable from a standard web browser on phones (375 px width and above), tablets, and desktops without installing any native app.
- **FR-020**: The UI MUST be clean and uncluttered — minimal visual noise, generous whitespace, and a task-focused layout consistent with Taskly's any.do-inspired aesthetic.
- **FR-021**: Within each tab, tasks MUST be displayed in ascending due-date order (soonest first); tasks without a due date MUST appear at the bottom of the list.
- **FR-022**: Completed tasks MUST remain visible within their original tab but MUST be visually distinguished (struck-through or dimmed) and displayed below all open tasks in that tab.

### Key Entities

- **User**: Represents an account. Key attributes: unique username, hashed password, display name, role (user / admin), created date.
- **Task**: Represents a single work item. Key attributes: short description (required, max 120 characters), due date (optional), status (open / closed), created timestamp, owner (User).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can register and submit their first task in under 60 seconds from first visiting Taskly.
- **SC-002**: Switching between Today / This Week / This Month / All tabs responds within 1 second with no full page reload.
- **SC-003**: All task data and completion states are intact after the browser is fully closed and reopened.
- **SC-004**: An admin can find and display all tasks for a specific user within 3 interactions from the admin dashboard landing page.
- **SC-005**: The UI is fully usable on screens 375 px wide or wider (phones, tablets, and desktops).
- **SC-006**: A child aged 8–14 can understand the dashboard layout and add a task without requiring verbal instruction (clean, minimal, icon-assisted, any.do-inspired design with no visual clutter).

## Assumptions

- **Authentication simplicity**: Username + password is sufficient for v1; no email address, phone number, or third-party OAuth required.
- **Admin bootstrapping**: At least one admin account is seeded at application startup (e.g., via a config file or environment variable); users cannot self-promote to admin through the UI.
- **No task editing**: Task description and due date cannot be changed after creation in v1; editing can be added in a future increment.
- **Task deletion is admin-only**: Regular users cannot delete their own tasks in v1 (they can only mark them complete). Admins can permanently delete any task.
- **No real-time sync**: The app does not push live updates across multiple open browser tabs simultaneously; a manual refresh is acceptable to reflect changes from another session.
- **Server timezone**: Today / This Week / This Month calculations use the server's local timezone; per-user timezone settings are out of scope for v1.
- **Small scale**: Designed for a household or classroom — up to approximately 30 users and 500 tasks per user; no high-concurrency requirements.
- **Minimum phone width**: 375 px is the minimum supported screen width (covers all modern iPhones and most Android phones).
- **No password recovery**: Forgot-password / password-reset flow is out of scope for v1.
