@echo off
echo =========================================
echo   AHRP Reports - Full Stack + Tunnel
echo =========================================
echo.

echo Starting all services for AHRP Report System...
echo.

REM Check if cloudflared is available
cloudflared --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: cloudflared not found. Tunnel will not start.
    echo Install from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
    set TUNNEL_AVAILABLE=false
) else (
    set TUNNEL_AVAILABLE=true
)

REM Kill any existing processes on our ports
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process on port 3000: %%a
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo Killing process on port 3001: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Starting Backend Server (Port 3001)...
cd server-report-system\backend
start "AHRP Backend" cmd /k "echo Backend Server Running... && npm start"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server (Port 3000)...
cd ..\frontend
start "AHRP Frontend" cmd /k "echo Frontend Server Running... && npm start"

echo Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul

cd ..\..

if "%TUNNEL_AVAILABLE%"=="true" (
    echo.
    echo Starting Cloudflare Tunnel...
    start "Cloudflare Tunnel" cmd /k "echo Cloudflare Tunnel Running... && cloudflared tunnel run ahrp-reports"
    
    echo.
    echo ===== SERVICES STARTED =====
    echo.
    echo Local Access:
    echo   Frontend: http://localhost:3000
    echo   Backend:  http://localhost:3001/api/health
    echo.
    echo Public Access (via Cloudflare Tunnel):
    echo   Frontend: https://your-domain.example.com
    echo   Backend:  https://api.your-domain.example.com/api/health
    echo.
    echo Discord Login Test:
    echo   Local:  http://localhost:3000/testing-login
    echo   Public: https://your-domain.example.com/testing-login
    echo.
) else (
    echo.
    echo ===== SERVICES STARTED (LOCAL ONLY) =====
    echo.
    echo Local Access:
    echo   Frontend: http://localhost:3000
    echo   Backend:  http://localhost:3001/api/health
    echo.
    echo To enable public access, install cloudflared and configure tunnel.
    echo.
)

echo Press any key to open the application in your browser...
pause >nul

REM Open the application
if "%TUNNEL_AVAILABLE%"=="true" (
    start https://your-domain.example.com
) else (
    start http://localhost:3000
)

echo.
echo All services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause