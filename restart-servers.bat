@echo off
title AHRP Report System - Server Restart
color 0E

echo.
echo ==========================================
echo    AHRP REPORT SYSTEM - SERVER RESTART
echo ==========================================
echo.

echo [1/2] Stopping existing servers...
call "%~dp0stop-servers.bat" >nul 2>&1

echo [2/2] Starting servers...
timeout /t 3 /nobreak >nul
call "%~dp0start-servers.bat"