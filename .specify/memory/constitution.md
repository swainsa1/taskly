<!--
SYNC IMPACT REPORT
==================
Version change: [unversioned template] → 1.0.0
Modified principles: none (initial ratification)
Added sections:
  - Core Principles (5 principles defined)
  - Technology Stack
  - Development Workflow
  - Governance
Removed sections: none (initial)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ aligned (no edits required; plan-template is
    generic enough to accommodate this constitution's Web app structure Option 2)
  - .specify/templates/spec-template.md ✅ aligned (mandatory sections match)
  - .specify/templates/tasks-template.md ✅ aligned (phase structure and test discipline
    match Principle III)
Deferred TODOs: none
-->

# Taskly Constitution

## Core Principles

### I. Web-First, Full-Stack Architecture

All features MUST be delivered as a full-stack web application with a clear separation between
the HTTP API layer (backend) and the browser UI layer (frontend). Each layer MUST be independently
testable. Backend routes MUST NOT embed presentation logic; frontend components MUST NOT embed
SQL or direct database calls.

**Rationale**: Separation of concerns keeps the codebase navigable as it grows and enables
front-end and back-end work to proceed in parallel.

### II. SQLite as the Single Source of Truth

All task data MUST be persisted in a SQLite database. Schema changes MUST be delivered as
versioned migration scripts (no hand-editing the database file). The application MUST apply
pending migrations automatically on startup. Direct file-system storage of task state outside
SQLite is prohibited.

**Rationale**: A single, well-defined persistence layer prevents data-consistency bugs and
makes backup, restore, and inspection trivial during development.

### III. Test-First Development (NON-NEGOTIABLE)

Tests MUST be written and confirmed to fail before any implementation code is added. The
Red → Green → Refactor cycle is strictly enforced. Untested code MUST NOT be merged to the
main branch. At minimum, each user story MUST have one integration test that exercises the
full request-to-database path.

**Rationale**: Test-first discipline catches contract regressions early and documents intent
in a machine-verifiable form.

### IV. API Contract Integrity

The backend MUST expose a versioned RESTful JSON API (e.g., `/api/v1/tasks`). Request and
response shapes MUST be documented before implementation begins (contract-first). Breaking
changes to an existing endpoint MUST increment the API version; additive changes (new optional
fields) MAY be made without version bump. The frontend MUST consume only the documented API
contract—never internal implementation details.

**Rationale**: Explicit contracts prevent silent regressions when front-end and back-end evolve
independently and make it possible to swap either layer without breaking the other.

### V. Simplicity & YAGNI

The simplest solution that satisfies the acceptance criteria MUST be chosen. Premature
abstractions, unused configuration knobs, and speculative generalization are prohibited.
Complexity MUST be justified in the plan's Complexity Tracking table before it is introduced.
Dependencies added to `package.json` MUST be the minimal set required.

**Rationale**: A task manager is a well-understood domain; over-engineering wastes time and
makes the codebase harder to hand off.

## Technology Stack

- **Runtime**: Node.js (LTS) with npm as the package manager.
- **Backend framework**: Express.js (preferred) or Fastify; MUST be chosen at project init and
  not swapped mid-project without a constitution amendment.
- **Database**: SQLite via the `better-sqlite3` package (synchronous, zero-config).
- **Migrations**: `db-migrate` or custom sequential migration scripts in `db/migrations/`.
- **Frontend**: Vanilla JS, React, or Vue — chosen at project init; MUST be documented in the
  plan. Server-side rendering is acceptable if chosen explicitly.
- **Testing**: Jest (unit + integration); Supertest for HTTP-layer integration tests.
- **Linting / formatting**: ESLint + Prettier; enforced in CI and as a pre-commit hook.
- **npm scripts MUST include**: `start`, `dev`, `test`, `lint`, `migrate`.

## Development Workflow

- Features MUST follow the Speckit lifecycle: spec → plan → tasks → implementation.
- All work MUST occur on a named feature branch; direct commits to `main` are prohibited.
- Every pull request MUST pass: lint check, full test suite, and manual smoke-test of the
  golden path (create → read → update → delete a task).
- Database migrations MUST be reviewed independently in their own commit before any application
  code that depends on the new schema is merged.
- Environment configuration (port, database path) MUST be read from environment variables with
  safe defaults; no hard-coded paths or secrets in source files.
- API documentation (OpenAPI or hand-written Markdown) MUST be updated in the same PR as any
  API contract change.

## Governance

This constitution supersedes all other project conventions. Any practice not addressed here is
decided at the plan stage and documented in the relevant `plan.md`.

**Amendment procedure**:
1. Open a PR with the proposed change to `.specify/memory/constitution.md`.
2. State the version bump type (MAJOR / MINOR / PATCH) and rationale in the PR description.
3. Update all affected templates and guidance files in the same PR.
4. Obtain at least one explicit approval before merging.

**Versioning policy**: Semantic versioning applies to the constitution itself (see version line
below). MAJOR = principle removed or fundamentally redefined; MINOR = new principle or section
added; PATCH = clarification or wording fix.

**Compliance review**: Each `plan.md` MUST include a Constitution Check section that verifies
the proposed design against every principle above. Violations require explicit justification in
the Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-05-09 | **Last Amended**: 2026-05-09
