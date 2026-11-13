@echo off
title Stop V-NMS Services
echo =====================================================================
echo                STOPPING V-NMS APPLICATION SERVICES
echo =====================================================================
echo.
taskkill /F /IM vnms-server.exe 2>nul
taskkill /F /FI "WINDOWTITLE eq V-NMS Backend*" 2>nul
taskkill /F /FI "WINDOWTITLE eq V-NMS Frontend*" 2>nul
echo [OK] All V-NMS backend and frontend server windows closed.
echo.
pause

