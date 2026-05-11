"""Authentication routes: register, login, logout, me."""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, field_validator

import services.user_service as user_service
from middleware.auth import get_session_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class RegisterBody(BaseModel):
    username: str
    display_name: str
    password: str

    @field_validator("username")
    @classmethod
    def username_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("username is required")
        return v

    @field_validator("display_name")
    @classmethod
    def display_name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("display_name is required")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 4:
            raise ValueError("password must be at least 4 characters")
        return v


class LoginBody(BaseModel):
    username: str
    password: str


def _user_payload(user: dict) -> dict:
    return {
        "id": user["id"],
        "username": user["username"],
        "display_name": user["display_name"],
        "role": user["role"],
        "status": user["status"],
    }


@router.post("/register", status_code=201)
async def register(body: RegisterBody, request: Request):
    existing = await user_service.find_by_username(body.username)
    if existing:
        raise HTTPException(status_code=409, detail="username already taken")

    user = await user_service.create_user(
        body.username, body.display_name, body.password
        # status defaults to "pending" — admin must approve before login works
    )
    # Do NOT set a session — user must wait for approval
    return {
        "message": "Registration successful. Your account is pending admin approval.",
        "status": "pending",
    }


@router.post("/login")
async def login(body: LoginBody, request: Request):
    user = await user_service.find_by_username(body.username)

    # Always verify password first (prevents username enumeration)
    if not user or not user_service.verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="invalid credentials")

    # Then check approval status
    if user["status"] == "pending":
        raise HTTPException(
            status_code=403,
            detail="account_pending",
        )
    if user["status"] == "rejected":
        raise HTTPException(
            status_code=403,
            detail="account_rejected",
        )

    payload = _user_payload(user)
    request.session["user"] = payload
    return payload


@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "logged out"}


@router.get("/me")
def me(request: Request):
    return get_session_user(request)
