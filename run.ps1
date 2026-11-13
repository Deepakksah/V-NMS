# V-NMS Enterprise Full-Stack Launcher (PowerShell)
$Host.UI.RawUI.WindowTitle = "V-NMS Full-Stack Launcher"
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "              V-NMS ENTERPRISE MANAGEMENT SYSTEM                    " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "[INFO] Initializing V-NMS Full-Stack Application..." -ForegroundColor Gray

# Ensure environment paths are updated
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Program Files\PostgreSQL\18\bin;C:\Program Files\Go\bin;C:\Program Files\nodejs"

# 1. PostgreSQL Service Check
Write-Host "`n[1/3] Checking PostgreSQL Service..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne "Running") {
        Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service -Name "postgresql-x64-18"
    }
    Write-Host "[OK] PostgreSQL 18 is running." -ForegroundColor Green
} else {
    Write-Host "[WARNING] Service postgresql-x64-18 not found. Ensure PostgreSQL is active." -ForegroundColor Yellow
}

$root = $PSScriptRoot
$frontendDir = Join-Path $root "frontend"
$backendDir = Join-Path $root "backend"

# 2. Start Backend
Write-Host "`n[2/3] Starting Go Backend Server on http://127.0.0.1:8081 ..." -ForegroundColor Cyan
$backendExe = Join-Path $backendDir "vnms-server.exe"
if (Test-Path $backendExe) {
    Start-Process cmd -ArgumentList "/k cd /d `"$backendDir`" && vnms-server.exe"
} else {
    Start-Process cmd -ArgumentList "/k cd /d `"$backendDir`" && go run ./cmd/server"
}

# 3. Start Frontend
Write-Host "[3/3] Starting React Vite Dashboard on http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd /d `"$frontendDir`" && npm run dev -- --host 127.0.0.1 --port 5173"

# 4. Information & Browser
Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host " V-NMS Application Launched Successfully!" -ForegroundColor Green
Write-Host " -------------------------------------------------------------" -ForegroundColor Gray
Write-Host " API Server:        http://127.0.0.1:8081" -ForegroundColor White
Write-Host " Web Dashboard:     http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host " Default Credentials:" -ForegroundColor Yellow
Write-Host "   SuperAdmin:      deepak.sah / admin123" -ForegroundColor Yellow
Write-Host "   Operator:        operator   / operator123" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Green

Write-Host "`nOpening browser in 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
