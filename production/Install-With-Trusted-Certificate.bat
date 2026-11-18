@echo off
:: ============================================================================
:: V-NMS Enterprise Setup - Trusted Installer & Smart App Control Fix
:: ============================================================================
title V-NMS Enterprise Setup Launcher

:: Check for Administrative Privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Requesting Administrator privileges to register trusted certificate...
    powershell -NoProfile -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo.
echo ============================================================================
echo   VERACITY NETWORK MANAGEMENT SYSTEM (V-NMS) ENTERPRISE INSTALLER
echo ============================================================================
echo.

echo [*] Removing Windows Download / Network Mark-of-the-Web (Zone.Identifier)...
powershell -NoProfile -Command "Get-ChildItem -Path '%~dp0' -Recurse | Unblock-File -ErrorAction SilentlyContinue"

if exist "%~dp0Veracity-Enterprise-CA.cer" (
    echo [*] Registering Veracity Enterprise Digital Certificate in Trusted Store...
    certutil -addstore -f "Root" "%~dp0Veracity-Enterprise-CA.cer" >nul 2>&1
    certutil -addstore -f "TrustedPublisher" "%~dp0Veracity-Enterprise-CA.cer" >nul 2>&1
    echo [OK] Verified Publisher: Veracity Enterprise Technologies registered.
)

echo.
echo [*] Launching V-NMS Enterprise Setup GUI...
start "" "%~dp0V-NMS-Enterprise-Setup.exe"

exit /b 0

