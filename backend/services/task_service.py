"""Task CRUD and date-scoped queries."""

from datetime import date, timedelta
from database import execute, rows_to_dicts, row_to_dict


def _today() -> str:
    return date.today().isoformat()


def _week_bounds() -> tuple[str, str]:
    today = date.today()
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)
    return start.isoformat(), end.isoformat()


def _month_bounds() -> tuple[str, str]:
    today = date.today()
    start = today.replace(day=1)
    if today.month == 12:
        end = today.replace(month=12, day=31)
    else:
        end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
    return start.isoformat(), end.isoformat()


_ORDER = """
    ORDER BY
        CASE WHEN status = 'open' THEN 0 ELSE 1 END,
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
        due_date ASC
"""

_COLS = "id, owner_id, description, due_date, status, created_at"


async def get_tasks_for_user(user_id: int, filter: str = "all") -> list[dict]:
    today = _today()

    if filter == "overdue":
        # Open tasks strictly past their due date (not including today)
        rs = await execute(
            f"""
            SELECT {_COLS} FROM tasks
            WHERE owner_id = ? AND status = 'open'
              AND due_date IS NOT NULL AND due_date < ?
            {_ORDER}
            """,
            [user_id, today],
        )
    elif filter == "today":
        rs = await execute(
            f"""
            SELECT {_COLS} FROM tasks
            WHERE owner_id = ?
              AND (
                (status = 'open'   AND due_date IS NOT NULL AND due_date <= ?)
                OR
                (status = 'closed' AND due_date = ?)
              )
            {_ORDER}
            """,
            [user_id, today, today],
        )
    elif filter == "week":
        start, end = _week_bounds()
        rs = await execute(
            f"""
            SELECT {_COLS} FROM tasks
            WHERE owner_id = ? AND due_date IS NOT NULL AND due_date BETWEEN ? AND ?
            {_ORDER}
            """,
            [user_id, start, end],
        )
    elif filter == "month":
        start, end = _month_bounds()
        rs = await execute(
            f"""
            SELECT {_COLS} FROM tasks
            WHERE owner_id = ? AND due_date IS NOT NULL AND due_date BETWEEN ? AND ?
            {_ORDER}
            """,
            [user_id, start, end],
        )
    else:
        rs = await execute(
            f"SELECT {_COLS} FROM tasks WHERE owner_id = ? {_ORDER}", [user_id]
        )

    return rows_to_dicts(rs)


async def create_task(user_id: int, description: str, due_date: str | None) -> dict:
    rs = await execute(
        "INSERT INTO tasks (owner_id, description, due_date) VALUES (?, ?, ?)",
        [user_id, description, due_date],
    )
    task_rs = await execute("SELECT * FROM tasks WHERE id = ?", [rs.last_insert_rowid])
    return row_to_dict(task_rs.rows[0], task_rs.columns)


async def _set_task_status(
    task_id: int, user_id: int, status: str, is_admin: bool = False
) -> dict | None:
    task_rs = await execute("SELECT * FROM tasks WHERE id = ?", [task_id])
    if not task_rs.rows:
        return None
    task = row_to_dict(task_rs.rows[0], task_rs.columns)
    if not is_admin and task["owner_id"] != user_id:
        raise PermissionError("forbidden")
    await execute("UPDATE tasks SET status = ? WHERE id = ?", [status, task_id])
    updated_rs = await execute("SELECT * FROM tasks WHERE id = ?", [task_id])
    return row_to_dict(updated_rs.rows[0], updated_rs.columns)


async def mark_task_complete(task_id: int, user_id: int, is_admin: bool = False) -> dict | None:
    return await _set_task_status(task_id, user_id, "closed", is_admin)


async def reopen_task(task_id: int, user_id: int, is_admin: bool = False) -> dict | None:
    return await _set_task_status(task_id, user_id, "open", is_admin)


async def delete_task(task_id: int) -> bool:
    rs = await execute("DELETE FROM tasks WHERE id = ?", [task_id])
    return rs.rows_affected > 0


_ADMIN_COLS = """
    t.id, t.owner_id, t.description, t.due_date, t.status, t.created_at,
    u.display_name AS owner_display_name, u.username AS owner_username
"""
_ADMIN_ORDER = """
    ORDER BY
        CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
        t.due_date ASC,
        u.display_name ASC
"""


async def get_all_tasks(user_id: int | None = None, filter: str = "all") -> list[dict]:
    today = _today()
    owner_filter = "AND t.owner_id = ?" if user_id else ""
    base_params = [user_id] if user_id else []

    if filter == "overdue":
        where = "AND t.status='open' AND t.due_date IS NOT NULL AND t.due_date < ?"
        params = base_params + [today]
    elif filter == "today":
        where = "AND ((t.status='open' AND t.due_date IS NOT NULL AND t.due_date<=?) OR (t.status='closed' AND t.due_date=?))"
        params = base_params + [today, today]
    elif filter == "week":
        start, end = _week_bounds()
        where = "AND t.due_date IS NOT NULL AND t.due_date BETWEEN ? AND ?"
        params = base_params + [start, end]
    elif filter == "month":
        start, end = _month_bounds()
        where = "AND t.due_date IS NOT NULL AND t.due_date BETWEEN ? AND ?"
        params = base_params + [start, end]
    else:
        where = ""
        params = base_params

    sql = f"""
        SELECT {_ADMIN_COLS}
        FROM tasks t JOIN users u ON u.id = t.owner_id
        WHERE 1=1 {owner_filter} {where}
        {_ADMIN_ORDER}
    """
    rs = await execute(sql, params if params else None)
    return rows_to_dicts(rs)
