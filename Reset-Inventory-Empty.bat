@echo off
:: ============================================================================
:: V-NMS Enterprise - 1-Click Inventory Reset & Data Cleaner
:: Clears all old/dummy devices and telemetry data from PostgreSQL database.
:: ============================================================================
echo.
echo ========================================================
echo   V-NMS Enterprise - Inventory & Device Data Cleaner
echo ========================================================
echo.
echo [*] Sending Reset Request to V-NMS Engine...

powershell -Command "try { $res = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8081/api/v1/devices/clear' -TimeoutSec 5; Write-Host '[SUCCESS]' $res.message -ForegroundColor Green } catch { Write-Host '[ERROR] Could not connect to V-NMS service on port 8081. Ensure VNMSService is running.' -ForegroundColor Red }"

echo.
pause

