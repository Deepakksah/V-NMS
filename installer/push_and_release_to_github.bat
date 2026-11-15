@echo off
setlocal enabledelayedexpansion
title V-NMS GitHub Push and Release Automation

echo ================================================================================
echo   VERACITY NETWORK MANAGEMENT SYSTEM (V-NMS) — GITHUB RELEASE DEPLOYER
echo ================================================================================
echo.
cd /d "E:\SahProject\V-NMS"

echo [*] Checking GitHub Authentication status...
gh auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] GitHub account not logged in.
    echo [*] Opening browser for 1-click GitHub authorization...
    echo.
    gh auth login -p https -w
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Authentication failed or was cancelled.
        pause
        exit /b 1
    )
)

echo.
echo [*] Configuring Git credentials for GitHub...
gh auth setup-git

echo.
echo [*] Pushing latest 16 enterprise commits to https://github.com/Deepakksah/V-NMS.git...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git push failed. Please verify repository write permissions.
    pause
    exit /b 1
)
echo [OK] Code successfully pushed to main branch!

echo.
echo [*] Publishing GitHub Release v2.0.0 and uploading setup assets...
echo     1. V-NMS-Enterprise-Setup.exe (515 MB All-in-One Bundle)
echo     2. V-NMS.msi (8.18 MB Core MSI Package)
echo     3. V-NMS_ERROR_AND_SOLUTION_GUIDE.pdf (Enterprise Manual)
echo.

gh release create v2.0.0 "production\V-NMS-Enterprise-Setup.exe" "production\V-NMS.msi" "production\V-NMS_ERROR_AND_SOLUTION_GUIDE.pdf" --title "Veracity Network Management System (V-NMS) v2.0.0" --notes-file "production\HOW_TO_INSTALL.txt"

if %ERRORLEVEL% NEQ 0 (
    echo [*] If release v2.0.0 already exists, uploading/overwriting assets...
    gh release upload v2.0.0 "production\V-NMS-Enterprise-Setup.exe" "production\V-NMS.msi" "production\V-NMS_ERROR_AND_SOLUTION_GUIDE.pdf" --clobber
)

echo.
echo ================================================================================
echo   SUCCESS! V-NMS v2.0.0 is live in GitHub Releases:
echo   https://github.com/Deepakksah/V-NMS/releases
echo ================================================================================
echo.
pause
