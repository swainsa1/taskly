"""User management: creation, lookup, password verification."""

import bcrypt
from database import execute, rows_to_dicts, row_to_dict


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), password_hash.encode())


async def find_by_username(username: str) -> dict | None:
    rs = await execute(
        "SELECT * FROM users WHERE username = ? COLLATE NOCASE", [username]
    )
    if not rs.rows:
        return None
    return row_to_dict(rs.rows[0], rs.columns)


async def find_by_id(user_id: int) -> dict | None:
    rs = await execute("SELECT * FROM users WHERE id = ?", [user_id])
    if not rs.rows:
        return None
    return row_to_dict(rs.rows[0], rs.columns)


async def create_user(
    username: str,
    display_name: str,
    password: str,
    role: str = "user",
    status: str = "pending",   # new users wait for admin approval
    avatar: str | None = None,
) -> dict:
    password_hash = _hash_password(password)
    rs = await execute(
        """
        INSERT INTO users (username, display_name, password_hash, role, status, avatar)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        [username, display_name, password_hash, role, status, avatar],
    )
    return await find_by_id(rs.last_insert_rowid)


async def update_avatar(user_id: int, avatar: str) -> dict | None:
    await execute("UPDATE users SET avatar = ? WHERE id = ?", [avatar, user_id])
    return await find_by_id(user_id)


async def list_users(status: str | None = None) -> list[dict]:
    """List users, optionally filtered by status."""
    if status:
        rs = await execute(
            "SELECT id, username, display_name, role, status, created_at FROM users WHERE status = ? ORDER BY created_at ASC",
            [status],
        )
    else:
        rs = await execute(
            "SELECT id, username, display_name, role, status, created_at FROM users ORDER BY display_name ASC"
        )
    return rows_to_dicts(rs)


async def set_user_status(user_id: int, status: str) -> dict | None:
    """Admin: approve or reject a user account."""
    await execute(
        "UPDATE users SET status = ? WHERE id = ?", [status, user_id]
    )
    return await find_by_id(user_id)
