# API Contract: Taskly REST API v1

**Base path**: `/api/v1`
**Content-Type**: `application/json` (all requests and responses)
**Auth mechanism**: Session cookie (`taskly_session`) set by login; required for all endpoints except `POST /auth/register` and `POST /auth/login`.

---

## Authentication

### POST /api/v1/auth/register

Register a new user account.

**Request body**:
```json
{
  "username": "string, required, 3–30 chars, alphanumeric + underscore",
  "display_name": "string, required, 1–50 chars",
  "password": "string, required, 8–72 chars"
}
```

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ "user": { "id": 1, "username": "...", "display_name": "...", "role": "user" } }` | Created; session cookie set |
| 400 | `{ "error": "validation", "fields": { "username": "required" } }` | Missing/invalid fields |
| 409 | `{ "error": "username_taken" }` | Username already exists |

---

### POST /api/v1/auth/login

Log in with existing credentials.

**Request body**:
```json
{
  "username": "string, required",
  "password": "string, required"
}
```

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "user": { "id": 1, "username": "...", "display_name": "...", "role": "user\|admin" } }` | Authenticated; session cookie set |
| 400 | `{ "error": "validation" }` | Missing fields |
| 401 | `{ "error": "invalid_credentials" }` | Wrong username or password |

---

### POST /api/v1/auth/logout

End the current session.

**Request body**: empty

**Responses**:

| Status | Body |
|--------|------|
| 200 | `{ "ok": true }` |

---

### GET /api/v1/auth/me

Return the currently authenticated user.

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "user": { "id": 1, "username": "...", "display_name": "...", "role": "user\|admin" } }` | Authenticated |
| 401 | `{ "error": "unauthenticated" }` | No valid session |

---

## User Tasks

*All endpoints require an authenticated session. Users can only access their own tasks.*

### GET /api/v1/tasks

Fetch the current user's tasks with optional time-scope filter.

**Query params**:

| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `filter` | `today`, `week`, `month`, `all` | `all` | Time window |

**Response 200**:
```json
{
  "tasks": [
    {
      "id": 42,
      "description": "Read chapter 4 of The Giver",
      "due_date": "2026-05-09",
      "status": "open",
      "created_at": "2026-05-08T19:00:00Z"
    }
  ]
}
```

Tasks are ordered: open tasks first by `due_date ASC` (nulls last), then closed tasks by `due_date ASC` (nulls last).

**Response 401**: Unauthenticated.

---

### POST /api/v1/tasks

Create a new task for the current user.

**Request body**:
```json
{
  "description": "string, required, 1–120 chars",
  "due_date": "string YYYY-MM-DD | null, optional"
}
```

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ "task": { "id": 43, "description": "...", "due_date": "2026-05-10", "status": "open", "created_at": "..." } }` | Created |
| 400 | `{ "error": "validation", "fields": { "description": "max_120_chars" } }` | Validation failure |
| 401 | Unauthenticated | |

---

### PATCH /api/v1/tasks/:id/complete

Mark the current user's task as complete.

**Request body**: empty

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "task": { "id": 43, "status": "closed" } }` | Updated |
| 403 | `{ "error": "forbidden" }` | Task belongs to another user |
| 404 | `{ "error": "not_found" }` | Task does not exist |

---

## Admin Endpoints

*All `/admin` endpoints require `role = 'admin'` in the session. Return 403 for regular users.*

### GET /api/v1/admin/users

List all registered users.

**Response 200**:
```json
{
  "users": [
    { "id": 1, "username": "alice", "display_name": "Alice", "role": "user", "created_at": "..." }
  ]
}
```

---

### GET /api/v1/admin/tasks

Fetch tasks across all users or for a specific user.

**Query params**:

| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `userId` | `all` or numeric user id | `all` | Scope by user |
| `filter` | `today`, `week`, `month`, `all` | `all` | Time window |

**Response 200**:
```json
{
  "tasks": [
    {
      "id": 42,
      "description": "Read chapter 4 of The Giver",
      "due_date": "2026-05-09",
      "status": "open",
      "created_at": "2026-05-08T19:00:00Z",
      "owner": { "id": 2, "display_name": "Alice" }
    }
  ]
}
```

Ordered: due_date ASC (nulls last), then by owner display_name ASC.

---

### POST /api/v1/admin/tasks

Create a task assigned to any user.

**Request body**:
```json
{
  "owner_id": 2,
  "description": "string, required, 1–120 chars",
  "due_date": "string YYYY-MM-DD | null, optional"
}
```

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ "task": { ... , "owner": { "id": 2, "display_name": "Alice" } } }` | Created |
| 400 | `{ "error": "validation" }` | Missing/invalid fields |
| 404 | `{ "error": "user_not_found" }` | owner_id does not exist |

---

### PATCH /api/v1/admin/tasks/:id/complete

Mark any user's task as complete.

**Request body**: empty

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "task": { "id": 43, "status": "closed" } }` | Updated |
| 404 | `{ "error": "not_found" }` | |

---

### DELETE /api/v1/admin/tasks/:id

Permanently delete any task.

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "ok": true }` | Deleted |
| 404 | `{ "error": "not_found" }` | |

---

## Common Error Shape

All error responses follow:
```json
{ "error": "snake_case_code", "message": "Human-readable explanation" }
```

HTTP status codes used: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.
