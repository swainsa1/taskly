"""FastAPI dependency functions for authentication and authorisation."""

from fastapi import Depends, HTTPException, Request, status


def get_session_user(request: Request) -> dict:
    """Require an authenticated session. Returns session payload or raises 401."""
    user = request.session.get("user")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="unauthenticated",
        )
    return user


def require_admin(user: dict = Depends(get_session_user)) -> dict:
    """Require admin role. Raises 403 if the authenticated user is not an admin."""
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="forbidden",
        )
    return user
