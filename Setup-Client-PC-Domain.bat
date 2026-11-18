@echo off
:: ============================================================================
:: V-NMS Enterprise - Client PC Local Domain Setup (v-nms.com)
:: Run this file as Administrator on any PC in your local network.
:: ============================================================================
echo.
echo ========================================================
echo   V-NMS Enterprise - Local Network Domain Configurator
echo ========================================================
echo.

:: Check for Administrator permissions
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Please right-click this file and select "Run as Administrator".
    echo.
    pause
    exit /b 1
)

set /p SERVER_IP="Enter V-NMS Server IP Address [Default: 172.168.1.11]: "
if "%SERVER_IP%"=="" set SERVER_IP=172.168.1.11

set HOSTS_FILE=%windir%\System32\drivers\etc\hosts

findstr /i "v-nms.com" "%HOSTS_FILE%" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo [INFO] Updating existing v-nms.com mapping to %SERVER_IP%...
    powershell -Command "(Get-Content '%HOSTS_FILE%') -notmatch 'v-nms' | Set-Content '%HOSTS_FILE%'"
)

echo %SERVER_IP%   v-nms.com >> "%HOSTS_FILE%"
echo %SERVER_IP%   www.v-nms.com >> "%HOSTS_FILE%"

echo.
echo ========================================================
echo [SUCCESS] Domain mapping added successfully!
echo You can now open V-NMS in your browser:
echo   http://v-nms.com
echo   http://www.v-nms.com
echo   http://%SERVER_IP%
echo ========================================================
echo.
pause
