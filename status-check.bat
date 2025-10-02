@echo off
title AHRP Report System - Status Check
color 0B

echo.
echo ==========================================
echo    AHRP REPORT SYSTEM - STATUS CHECK
echo ==========================================
echo.

echo Checking server status...
echo.

echo [Backend - Port 3001]
netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Backend is RUNNING on port 3001
    curl -s http://localhost:3001/api/health >nul 2>&1
    if %errorlevel% == 0 (
        echo ✓ Backend API is responding
    ) else (
        echo ⚠ Backend is running but API not responding
    )
) else (
    echo ❌ Backend is NOT running
)
echo.

echo [Frontend - Port 3000]
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Frontend is RUNNING on port 3000
) else (
    echo ❌ Frontend is NOT running
)
echo.

echo [URLs]
echo Backend API:  http://localhost:3001
echo Frontend UI:  http://localhost:3000
echo Health Check: http://localhost:3001/api/health
echo.

echo [Quick Test Commands for FiveM]
echo /report          - Opens NUI interface
echo F7               - Opens NUI interface  
echo /reportbug test  - Quick bug report
echo /testreport      - Test functionality
echo.

echo ==========================================
echo    STATUS CHECK COMPLETE
echo ==========================================
echo.
echo Press any key to exit...
pause >nul