# Research: Taskly — Multi-User Task Tracker

**Branch**: `001-task-tracker-multi-user` | **Date**: 2026-05-09
**Phase**: 0 — Unknowns resolved before design

---

## 1. Frontend Framework

**Decision**: React 18 + Vite

**Rationale**: Taskly requires multiple interactive views (four tab-filtered lists, admin
dashboard with user selector, real-time UI updates on task completion). React's component
model makes each tab and task card naturally composable, and Vite's dev server gives instant
HMR for a fast iteration cycle. React has the best ecosystem fit for the any.do-style
polished UI (Framer Motion for subtle animations, headless component libraries for accessible
tabs and modals).

**Alternatives considered**:
- Vanilla JS: No build step, but managing tab state, conditional rendering, and optimistic UI
  updates by hand quickly becomes unruly. Rejected for maintainability.
- Vue 3: Comparable capability. Rejected in favour of React because the broader React
  ecosystem (e.g., React Query for data fetching, Radix UI for accessible primitives) is
  better suited to the polished UI goal.

---

## 2. Backend Framework

**Decision**: Express.js 4 (Node.js LTS 20+)

**Rationale**: Express is the constitution-preferred framework (listed first), well-understood,
minimal, and has excellent middleware support for sessions and JSON APIs. No GraphQL or
WebSocket needed for v1 (no real-time sync). Fastify would be marginally faster but Express
is simpler and the scale (~30 users) makes throughput irrelevant.

**Alternatives considered**:
- Fastify: Rejected — marginally better perf at scale is not needed; adds learning curve.
- Koa: Rejected — less ecosystem support; no clear advantage over Express here.

---

## 3. SQLite Client

**Decision**: `better-sqlite3` (synchronous API)

**Rationale**: The constitution mandates `better-sqlite3`. Its synchronous API eliminates
callback/promise complexity in route handlers, making code straightforward to read and test.
At the expected scale (≤30 users, ≤500 tasks each) there is no throughput concern with
synchronous I/O.

**Alternatives considered**:
- `node-sqlite3` (async): More complex, no meaningful benefit at this scale.
- `Prisma` with SQLite: Adds ORM overhead, schema generation complexity, and a binary engine.
  Violates Principle V (Simplicity & YAGNI).

---

## 4. Authentication Strategy

**Decision**: Session-based authentication with `express-session` + `connect-sqlite3`

**Rationale**: Username/password login with a server-side session cookie is the simplest
correct approach. Sessions are stored in the same SQLite file (via `connect-sqlite3`), so
no additional infrastructure is needed. `bcryptjs` handles password hashing.

JWT was evaluated but rejected — JWTs require a token store or short expiry + refresh logic
to allow server-side logout, which adds complexity with no benefit for a single-server
household app. Session cookies with `httpOnly` and `sameSite=strict` are equally secure and
simpler to reason about.

**Alternatives considered**:
- JWT: Rejected — stateless tokens complicate logout; overkill for single-server use.
- Passport.js: Rejected — abstraction layer unnecessary for a single local strategy.

---

## 5. CSS / Styling Approach

**Decision**: Tailwind CSS v3 (utility-first)

**Rationale**: Tailwind enables the clean, minimal, any.do-inspired aesthetic without writing
bespoke CSS files. It has excellent responsive breakpoint utilities (`sm:`, `md:`) that make
phone-first layouts straightforward. Combined with a small custom design token set (primary
colour, accent, spacing scale) it keeps the UI consistent without a heavy component library.

**Alternatives considered**:
- CSS Modules with custom SCSS: More control but slower iteration; harder to enforce design
  consistency across components.
- Chakra UI / MUI: Pre-built components speed up development but impose design opinions that
  conflict with the minimal any.do aesthetic; adds significant bundle weight.

---

## 6. Database Migration Strategy

**Decision**: Custom sequential migration scripts with a `migrations` table

**Rationale**: `db-migrate` adds a CLI dependency and config file; for two tables and a handful
of v1 migrations, a lightweight custom migrator (a single `migrate.js` file that reads
`backend/src/db/migrations/*.sql` files in order and tracks applied migrations in a
`schema_migrations` table) is simpler and has zero extra dependencies.

**Alternatives considered**:
- `db-migrate`: Full-featured but over-engineered for two tables.
- `Knex` migrations: Adds a query builder as a dependency; YAGNI.

---

## 7. Testing Stack

**Decision**: Vitest (frontend) + Jest + Supertest (backend)

**Rationale**: Vitest integrates naturally with Vite and has a Jest-compatible API, so
developers use the same assertion style across both layers. Jest + Supertest is the
standard combination for Express integration tests (spin up the app, fire HTTP requests,
assert responses). The constitution mandates tests before implementation.

---

## 8. "Today / This Week / This Month" Date Calculation

**Decision**: Server-side, using the server's local timezone (UTC-aligned ISO date strings
stored in SQLite)

**Rationale**: The spec assumption explicitly states server timezone. Due dates are stored as
`DATE` strings (`YYYY-MM-DD`) in SQLite. The backend computes window boundaries at query
time using Node.js `Date` arithmetic and returns only matching tasks per filter parameter.
This keeps filtering logic in one place and avoids sending all tasks to the frontend for
client-side filtering.

---

## 9. Admin Seeding

**Decision**: Environment variable `ADMIN_USERNAME` / `ADMIN_PASSWORD` + startup auto-seed

**Rationale**: On first boot, if no user with `role = 'admin'` exists, the app reads
`ADMIN_USERNAME` and `ADMIN_PASSWORD` from environment (with safe defaults for dev:
`admin` / `changeme`) and creates the admin account. This satisfies the spec assumption with
zero UI needed.

---

## Summary of All Decisions

| Topic | Decision |
|-------|----------|
| Frontend | React 18 + Vite |
| Backend | Express.js 4, Node.js LTS 20+ |
| SQLite client | better-sqlite3 (sync) |
| Auth | express-session + connect-sqlite3 + bcryptjs |
| Styling | Tailwind CSS v3 |
| Migrations | Custom sequential SQL scripts |
| Testing | Vitest (frontend) + Jest + Supertest (backend) |
| Date filtering | Server-side, server timezone, ISO date strings |
| Admin seed | Env-var-driven auto-seed on first boot |
