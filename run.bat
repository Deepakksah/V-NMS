@echo off
setlocal enabledelayedexpansion
title V-NMS Full-Stack Launcher

echo =====================================================================
echo                V-NMS ENTERPRISE MANAGEMENT SYSTEM
echo =====================================================================
echo [INFO] Initializing V-NMS Full-Stack Application...
echo.

:: Ensure all standard paths are active in this session
set "PATH=%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;%SystemRoot%\System32\WindowsPowerShell\v1.0\;C:\Program Files\PostgreSQL\18\bin;C:\Program Files\Go\bin;C:\Program Files\nodejs;%PATH%"

:: 1. Check PostgreSQL Service
echo [1/3] Checking PostgreSQL Service...
sc query postgresql-x64-18 | findstr /I "RUNNING" >nul
if %errorlevel% neq 0 (
    echo [INFO] Starting PostgreSQL service...
    net start postgresql-x64-18
) else (
    echo [OK] PostgreSQL 18 is running.
)

:: 2. Launch Backend (Go Engine)
echo.
echo [2/3] Starting Go Backend Server on http://127.0.0.1:8081 ...
if exist "%~dp0backend\vnms-server.exe" (
    start "V-NMS Backend (Port 8081)" cmd /k "cd /d %~dp0backend && vnms-server.exe"
) else (
    start "V-NMS Backend (Port 8081)" cmd /k "cd /d %~dp0backend && go run ./cmd/server"
)

:: 3. Launch Frontend (React + Vite)
echo.
echo [3/3] Starting React Vite Dashboard on http://localhost:5173 ...
start "V-NMS Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

:: 4. Information & Browser launch
echo.
echo =====================================================================
echo  V-NMS Application Launched Successfully!
echo  -------------------------------------------------------------
echo  API Server:        http://127.0.0.1:8081
echo  Web Dashboard:     http://localhost:5173
echo.
echo  Default Credentials:
echo    SuperAdmin:      deepak.sah / admin123
echo    Operator:        operator   / operator123
echo =====================================================================
echo.
echo Opening browser in 3 seconds...
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173

echo.
echo [OK] All services running. Please keep the Backend and Frontend command windows open.
