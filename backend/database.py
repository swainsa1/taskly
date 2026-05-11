"""
Database layer — libsql-client works with both:
  Local dev:  DATABASE_URL=file:./db/taskly.sqlite  (no auth token)
  Production: DATABASE_URL=libsql://xxx.turso.io    (+ TURSO_AUTH_TOKEN)
"""

import os
from pathlib import Path
from typing import Any

import libsql_client

_client: libsql_client.Client | None = None


def get_client() -> libsql_client.Client:
    if _client is None:
        raise RuntimeError("Database not initialised — call init_db() first")
    return _client


async def execute(sql: str, params: list | None = None):
    """Run a single SQL statement, returns ResultSet."""
    client = get_client()
    if params:
        return await client.execute(libsql_client.Statement(sql, params))
    return await client.execute(sql)


async def executemany(statements: list[tuple[str, list]]):
    """Run multiple statements in a batch (atomic)."""
    client = get_client()
    stmts = [libsql_client.Statement(sql, p) for sql, p in statements]
    return await client.batch(stmts)


def row_to_dict(row: tuple, columns: tuple) -> dict:
    """Convert a libsql Row tuple + column names to a plain dict."""
    return dict(zip(columns, row))


def rows_to_dicts(rs) -> list[dict]:
    """Convert a full ResultSet to a list of dicts."""
    return [row_to_dict(r, rs.columns) for r in rs.rows]


async def init_db() -> None:
    """Open DB connection and run pending migrations."""
    global _client

    url = os.getenv("DATABASE_URL", "file:./db/taskly.sqlite")
    auth_token = os.getenv("TURSO_AUTH_TOKEN") or None

    # For local file URLs ensure the parent directory exists
    if url.startswith("file:"):
        db_path = url[5:]  # strip "file:"
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    _client = libsql_client.create_client(url=url, auth_token=auth_token)

    await _run_migrations()


async def close_db() -> None:
    global _client
    if _client:
        await _client.close()
        _client = None


async def _run_migrations() -> None:
    """Apply SQL migration files in filename order, skip already-applied ones."""
    # Bootstrap tracking table first
    await execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
        )
        """
    )

    applied_rs = await execute("SELECT filename FROM schema_migrations")
    applied = {r[0] for r in applied_rs.rows}

    migrations_dir = Path(__file__).parent / "migrations"
    for sql_file in sorted(migrations_dir.glob("*.sql")):
        if sql_file.name in applied:
            continue
        print(f"[migrate] Applying {sql_file.name}")
        # executescript not available in libsql; split on semicolons
        sql_text = sql_file.read_text()
        statements = [s.strip() for s in sql_text.split(";") if s.strip()]
        for stmt in statements:
            await execute(stmt)
        await execute(
            "INSERT INTO schema_migrations (filename) VALUES (?)", [sql_file.name]
        )
    print("[migrate] All migrations up to date.")
