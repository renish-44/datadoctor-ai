#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  DataDoctor AI — Local Development Server Launcher
#  Starts both backend and frontend in parallel
# ──────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo " ╔══════════════════════════════════════════════════╗"
echo " ║        DataDoctor AI — Starting Servers          ║"
echo " ╚══════════════════════════════════════════════════╝"
echo ""

cleanup() {
    echo ""
    echo " Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo " Done."
}
trap cleanup EXIT INT TERM

# ── Start Backend ──────────────────────────────────────────────
echo "[1/2] Starting Backend (FastAPI) on http://localhost:8000 ..."
cd "$SCRIPT_DIR/backend"
./venv/bin/python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# ── Start Frontend ─────────────────────────────────────────────
echo "[2/2] Starting Frontend (Vite)   on http://localhost:3000 ..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo " ✓ Both servers are running."
echo ""
echo "   Backend:   http://localhost:8000"
echo "   Frontend:  http://localhost:3000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo " Press Ctrl+C to stop both servers."
echo ""

wait
