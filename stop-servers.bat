@echo off
title AHRP Report System - Server Stopper
color 0C

echo.
echo ==========================================
echo    AHRP REPORT SYSTEM - SERVER STOPPER
echo ==========================================
echo.

echo Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul

echo Killing processes on ports 3000 and 3001...
for /f "tokens=5" %%i in ('netstat -ano 2^>nul ^| findstr ":3001"') do (
    if not "%%i"=="0" (
        echo Killing PID %%i on port 3001...
        taskkill /f /pid %%i >nul 2>&1
    )
)
for /f "tokens=5" %%i in ('netstat -ano 2^>nul ^| findstr ":3000"') do (
    if not "%%i"=="0" (
        echo Killing PID %%i on port 3000...
        taskkill /f /pid %%i >nul 2>&1
    )
)

echo ✓ All servers and ports cleaned up!

echo.
echo Checking for remaining processes on ports 3000 and 3001...
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠ Port 3000 still in use
) else (
    echo ✓ Port 3000 is free
)

netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠ Port 3001 still in use
) else (
    echo ✓ Port 3001 is free
)

echo.
echo ==========================================
echo    SERVERS STOPPED!
echo ==========================================
echo.
echo Press any key to exit...
pause >nul