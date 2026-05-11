# Data Model: Taskly

**Branch**: `001-task-tracker-multi-user` | **Date**: 2026-05-09

---

## Entities

### users

Represents a Taskly account (student, parent, teacher, or admin).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Internal surrogate key |
| `username` | TEXT | NOT NULL, UNIQUE | Login identifier; case-insensitive enforced at app layer |
| `display_name` | TEXT | NOT NULL | Human-readable name shown in admin dashboard |
| `password_hash` | TEXT | NOT NULL | bcrypt hash; never stored as plaintext |
| `role` | TEXT | NOT NULL, DEFAULT 'user' | Enum: `'user'` \| `'admin'` |
| `created_at` | TEXT | NOT NULL, DEFAULT current_timestamp | ISO 8601 UTC datetime |

**Constraints**:
- `username` UNIQUE — enforced at DB level; duplicate check shown at registration with friendly message.
- `role` CHECK (`role` IN ('user', 'admin')) — DB-level guard.

**State transitions**: No state machine; role is set at creation and can only be changed via DB/env seed in v1.

---

### tasks

Represents a single work item owned by a user.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Internal surrogate key |
| `owner_id` | INTEGER | NOT NULL, FK → users.id ON DELETE CASCADE | Owning user |
| `description` | TEXT | NOT NULL, CHECK(length ≤ 120) | Max 120 chars; validated at app layer too |
| `due_date` | TEXT | NULL | ISO date string `YYYY-MM-DD`; NULL = no due date |
| `status` | TEXT | NOT NULL, DEFAULT 'open' | Enum: `'open'` \| `'closed'` |
| `created_at` | TEXT | NOT NULL, DEFAULT current_timestamp | ISO 8601 UTC datetime |

**Constraints**:
- `status` CHECK (`status` IN ('open', 'closed')) — DB-level guard.
- `description` length validated at both API (FR-003) and DB layer.
- `due_date` format validated at API layer before insert (must be valid `YYYY-MM-DD` or null).
- Cascade delete: deleting a user removes all their tasks (admin operation, out of scope v1 — cascade is defensive).

**State transitions**:

```
open ──[mark complete]──▶ closed
```

No re-open in v1 (closed is terminal). Admin can delete (permanent removal).

---

### schema_migrations

Tracks which SQL migration files have been applied.

| Column | Type | Constraints |
|--------|------|-------------|
| `filename` | TEXT | PRIMARY KEY |
| `applied_at` | TEXT | NOT NULL, DEFAULT current_timestamp |

---

## Relationships

```
users ──< tasks   (one user has many tasks; owner_id FK)
```

No many-to-many relationships in v1.

---

## Date Filtering Logic

The backend computes window boundaries at query time in the server's local timezone.
`due_date` is stored as `YYYY-MM-DD` text and compared as a string (SQLite TEXT comparison
is lexicographic, which works correctly for ISO dates).

| Tab | SQL Condition |
|-----|--------------|
| Today | `due_date <= :today AND status = 'open'` (open + overdue) OR `due_date = :today` |
| This Week | `due_date >= :weekStart AND due_date <= :weekEnd` |
| This Month | `due_date >= :monthStart AND due_date <= :monthEnd` |
| All | no `due_date` filter |

Precise Today logic:
- Open tasks: `due_date <= :today` (includes overdue)
- Closed tasks: `due_date = :today` (only today's closed tasks shown in Today tab)

---

## Migration Files

```
backend/src/db/migrations/
├── 001_create_schema_migrations.sql
├── 002_create_users.sql
└── 003_create_tasks.sql
```

---

## SQLite File Location

```
backend/db/taskly.sqlite   ← default; overridable via DB_PATH env var
```

---

## Indexes

| Table | Column(s) | Reason |
|-------|-----------|--------|
| tasks | `owner_id` | All user task queries filter by owner |
| tasks | `due_date` | Date-window filter queries |
| tasks | `status` | Filter open vs closed |
| users | `username` | Login lookup |
