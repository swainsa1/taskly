"""User task routes: list, create, complete."""

import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator

import services.task_service as task_service
from middleware.auth import get_session_user
from tags import TAGS

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class CreateTaskBody(BaseModel):
    description: str
    due_date: str   # required — every task must have a due date
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
    return {
        "id": task["id"],
        "description": task["description"],
        "due_date": task["due_date"],
        "tag": task.get("tag", "Others"),
        "status": task["status"],
        "created_at": task["created_at"],
    }


@router.get("")
async def list_tasks(
    filter: str = Query(default="all", pattern="^(overdue|today|week|month|all)$"),
    user: dict = Depends(get_session_user),
):
    rows = await task_service.get_tasks_for_user(user["id"], filter)
    return [_fmt(r) for r in rows]


@router.post("", status_code=201)
async def create_task(body: CreateTaskBody, user: dict = Depends(get_session_user)):
    task = await task_service.create_task(user["id"], body.description, body.due_date, body.tag)
    return _fmt(task)


@router.patch("/{task_id}/complete")
async def complete_task(task_id: int, user: dict = Depends(get_session_user)):
    try:
        task = await task_service.mark_task_complete(task_id, user["id"])
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")
    return _fmt(task)


@router.patch("/{task_id}/reopen")
async def reopen_task(task_id: int, user: dict = Depends(get_session_user)):
    try:
        task = await task_service.reopen_task(task_id, user["id"])
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")
    return _fmt(task)
