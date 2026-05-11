"""Taskly backend — FastAPI entry point."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

import database
import services.user_service as user_service
from routers import auth, tasks, admin

load_dotenv()

SESSION_SECRET = os.getenv("SESSION_SECRET", "dev-secret-please-change-in-production")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "adminpassword")
PORT = int(os.getenv("PORT", "3001"))

# Allowed origins: Vite dev + production frontend URL
_origins = ["http://localhost:5173"]
if os.getenv("FRONTEND_URL"):
    _origins.append(os.getenv("FRONTEND_URL"))


# ── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(_app: FastAPI):
    await database.init_db()
    await _seed_admin()
    yield
    await database.close_db()


async def _seed_admin():
    existing = await user_service.find_by_username(ADMIN_USERNAME)
    if not existing:
        print(f"[seed] Creating admin user '{ADMIN_USERNAME}'")
        await user_service.create_user(
            ADMIN_USERNAME, "Admin", ADMIN_PASSWORD,
            role="admin",
            status="approved",   # admin never needs approval
        )
    else:
        print(f"[seed] Admin '{ADMIN_USERNAME}' already exists")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Taskly API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    session_cookie="taskly_session",
    same_site="lax",
    https_only=os.getenv("NODE_ENV") == "production",
    max_age=7 * 24 * 3600,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ── Production: serve Vite build ─────────────────────────────────────────────
if os.getenv("NODE_ENV") == "production":
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    dist = Path(__file__).parent.parent / "frontend" / "dist"
    if dist.exists():
        app.mount("/assets", StaticFiles(directory=str(dist / "assets")), name="assets")

        @app.get("/{full_path:path}")
        def spa_fallback(full_path: str):
            return FileResponse(str(dist / "index.html"))


# ── Dev entry point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
