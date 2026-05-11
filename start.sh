#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Taskly — start both backend (FastAPI) and frontend (Vite) in one command
#
# Local dev uses SQLite file (DATABASE_URL=file:./db/taskly.sqlite in backend/.env)
# Production uses Turso (set DATABASE_URL + TURSO_AUTH_TOKEN in backend/.env)
#
# Usage: ./start.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════╗${NC}"
echo -e "${CYAN}║   Taskly — starting up…      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════╝${NC}"
echo ""

# ── Backend (FastAPI via uv) ──────────────────────────────────────────────────
echo -e "${GREEN}▶ Backend${NC}  http://localhost:3001"
(
  cd "$BACKEND_DIR"
  if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}  Created backend/.env from .env.example — edit it to set secrets${NC}"
  fi
  uv run uvicorn main:app --host 0.0.0.0 --port 3001 --reload
) &
BACKEND_PID=$!

sleep 2   # give backend time to migrate + seed

# ── Frontend (Vite) ───────────────────────────────────────────────────────────
echo -e "${GREEN}▶ Frontend${NC} http://localhost:5173"
(
  cd "$FRONTEND_DIR"
  if [ ! -d node_modules ]; then
    echo "  Installing frontend dependencies…"
    npm install
  fi
  npm run dev
) &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down…${NC}"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  echo "Done."
}
trap cleanup INT TERM

echo ""
echo -e "  ${CYAN}App:${NC}      http://localhost:5173"
echo -e "  ${CYAN}API docs:${NC} http://localhost:3001/docs"
echo -e "  ${CYAN}Health:${NC}   http://localhost:3001/api/health"
echo ""
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop both servers."
echo ""

wait
