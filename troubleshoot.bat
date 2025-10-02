@echo off
title AHRP Report System - Troubleshooter
color 0D

echo.
echo ==========================================
echo    AHRP REPORT SYSTEM - TROUBLESHOOTER
echo ==========================================
echo.

echo Checking system status...
echo.

echo [1] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Node.js is installed
    node --version
) else (
    echo ❌ Node.js is not installed or not in PATH
)
echo.

echo [2] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ npm is installed
    npm --version
) else (
    echo ❌ npm is not installed or not in PATH
)
echo.

echo [3] Checking for processes on port 3000...
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠ Port 3000 is in use:
    netstat -ano | findstr ":3000"
) else (
    echo ✓ Port 3000 is free
)
echo.

echo [4] Checking for processes on port 3001...
netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠ Port 3001 is in use:
    netstat -ano | findstr ":3001"
) else (
    echo ✓ Port 3001 is free
)
echo.

echo [5] Checking backend dependencies...
cd /d "C:\Users\anton\OneDrive\Desktop\ahrpo scripts\logging_website\server-report-system\backend"
if exist "node_modules" (
    echo ✓ Backend node_modules exists
) else (
    echo ❌ Backend node_modules missing - run 'npm install' in backend folder
)
echo.

echo [6] Checking frontend dependencies...
cd /d "C:\Users\anton\OneDrive\Desktop\ahrpo scripts\logging_website\server-report-system\frontend"
if exist "node_modules" (
    echo ✓ Frontend node_modules exists
) else (
    echo ❌ Frontend node_modules missing - run 'npm install' in frontend folder
)
echo.

echo [7] Checking for running Node.js processes...
tasklist | findstr "node.exe" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠ Node.js processes found:
    tasklist | findstr "node.exe"
) else (
    echo ✓ No Node.js processes running
)
echo.

echo ==========================================
echo    DIAGNOSTIC COMPLETE
echo ==========================================
echo.
echo If you see any ❌ errors above, those need to be fixed first.
echo If you see ⚠ warnings, you may need to stop existing processes.
echo.
echo Press any key to exit...
pause >nul