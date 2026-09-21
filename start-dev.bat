@echo off
REM ──────────────────────────────────────────────────────────
REM  DataDoctor AI — Local Development Server Launcher
REM  Starts both backend and frontend in parallel
REM ──────────────────────────────────────────────────────────
title DataDoctor AI — Dev Servers

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║        DataDoctor AI — Starting Servers          ║
echo  ╚══════════════════════════════════════════════════╝
echo.

REM ── Start Backend ──────────────────────────────────────────
echo [1/2] Starting Backend (FastAPI) on http://localhost:8000 ...
cd /d "%~dp0backend"
start "DataDoctor Backend" cmd /k ".\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

REM ── Start Frontend ─────────────────────────────────────────
echo [2/2] Starting Frontend (Vite)   on http://localhost:3000 ...
cd /d "%~dp0frontend"
start "DataDoctor Frontend" cmd /k "npm run dev"

echo.
echo  ✓ Both servers are starting in separate windows.
echo.
echo    Backend:   http://localhost:8000
echo    Frontend:  http://localhost:3000
echo    API Docs:  http://localhost:8000/docs
echo.
echo  Press any key to close this launcher window...
pause >nul
