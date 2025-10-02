@echo off
title AHRP Report System - Server Starter
color 0A

echo.
echo ==========================================
echo    AHRP REPORT SYSTEM - SERVER STARTER
echo ==========================================
echo.

echo [1/4] Killing existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo [1.5/4] Freeing up ports 3000 and 3001...
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":3001"') do (
    if not "%%i"=="0" taskkill /f /pid %%i >nul 2>&1
)
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":3000"') do (
    if not "%%i"=="0" taskkill /f /pid %%i >nul 2>&1
)
timeout /t 3 /nobreak >nul

echo [2/4] Starting Backend Server (Port 3001)...
cd /d "C:\Users\anton\OneDrive\Desktop\ahrpo scripts\logging_website\server-report-system\backend"
start "AHRP Backend" cmd /k "echo Starting AHRP Backend Server... && npm start"

echo [3/4] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo [4/4] Starting Frontend Server (Port 3000)...
cd /d "C:\Users\anton\OneDrive\Desktop\ahrpo scripts\logging_website\server-report-system\frontend"
start "AHRP Frontend" cmd /k "set PORT=3000&& set BROWSER=none&& echo Starting AHRP Frontend Server...&& echo y | npm start"

echo.
echo ==========================================
echo    SERVERS STARTING IN SEPARATE WINDOWS
echo ==========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to open connection test...
pause >nul

echo Opening connection test page...
start "" "C:\Users\anton\OneDrive\Desktop\ahrpo scripts\logging_website\connection-test.html"

echo.
echo ==========================================
echo    STARTUP COMPLETE!
echo ==========================================
echo.
echo Both servers should now be running in separate windows.
echo Check the individual windows for any error messages.
echo.
echo Press any key to exit this window...
pause >nul