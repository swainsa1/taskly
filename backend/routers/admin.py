"""Admin routes: view all users/tasks, create/complete/delete any task."""

import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator

import services.task_service as task_service
import services.user_service as user_service
from middleware.auth import require_admin
from tags import TAGS

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class AdminCreateTaskBody(BaseModel):
    owner_id: int
    description: str
    due_date: str   # required
    tag: str = 'Others'

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("description is required")
        if len(v) > 120:
            raise ValueError("description must be 120 characters or fewer")
        return v

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("due_date is required")
        if not DATE_RE.match(v.strip()):
            raise ValueError("due_date must be YYYY-MM-DD")
        return v.strip()

    @field_validator("tag")
    @classmethod
    def validate_tag(cls, v: str) -> str:
        if v not in TAGS:
            return 'Others'
        return v


def _fmt(task: dict) -> dict:
    d = {
        "id": task["id"],
        "owner_id": task["owner_id"],
        "description": task["description"],
        "due_date": task["due_date"],
        "tag": task.get("tag", "Others"),
        "status": task["status"],
        "created_at": task["created_at"],
    }
    if "owner_display_name" in task:
        d["owner"] = {
            "display_name": task["owner_display_name"],
            "username": task["owner_username"],
        }
    return d


def _fmt_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "username": u["username"],
        "display_name": u["display_name"],
        "role": u["role"],
        "status": u["status"],
        "created_at": u.get("created_at"),
    }


@router.get("/users")
async def list_users(
    status: Optional[str] = Query(default=None, pattern="^(pending|approved|rejected)$"),
    _admin: dict = Depends(require_admin),
):
    users = await user_service.list_users(status=status)
    return [_fmt_user(u) for u in users]


@router.patch("/users/{user_id}/approve")
async def approve_user(user_id: int, _admin: dict = Depends(require_admin)):
    user = await user_service.set_user_status(user_id, "approved")
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return _fmt_user(user)


@router.patch("/users/{user_id}/reject")
async def reject_user(user_id: int, _admin: dict = Depends(require_admin)):
    user = await user_service.set_user_status(user_id, "rejected")
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return _fmt_user(user)


@router.get("/tasks")
async def list_all_tasks(
    userId: Optional[int] = Query(default=None),
    filter: str = Query(default="all", pattern="^(overdue|today|week|month|all)$"),
    _admin: dict = Depends(require_admin),
):
    rows = await task_service.get_all_tasks(user_id=userId, filter=filter)
    return [_fmt(r) for r in rows]


@router.post("/tasks", status_code=201)
async def create_task_for_user(body: AdminCreateTaskBody, _admin: dict = Depends(require_admin)):
    owner = await user_service.find_by_id(body.owner_id)
    if not owner:
        raise HTTPException(status_code=404, detail="user not found")
    task = await task_service.create_task(body.owner_id, body.description, body.due_date, body.tag)
    return _fmt(task)


@router.patch("/tasks/{task_id}/complete")
async def complete_task(task_id: int, admin: dict = Depends(require_admin)):
    try:
        task = await task_service.mark_task_complete(task_id, admin["id"], is_admin=True)
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")
    return _fmt(task)


@router.patch("/tasks/{task_id}/reopen")
async def reopen_task(task_id: int, admin: dict = Depends(require_admin)):
    try:
        task = await task_service.reopen_task(task_id, admin["id"], is_admin=True)
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")
    return _fmt(task)


@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(task_id: int, _admin: dict = Depends(require_admin)):
    deleted = await task_service.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="task not found")
