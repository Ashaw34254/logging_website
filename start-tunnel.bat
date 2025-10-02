@echo off
echo ====================================
echo   AHRP Reports - Cloudflare Tunnel
echo ====================================
echo.

echo Checking if cloudflared is installed...
cloudflared --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: cloudflared is not installed or not in PATH
    echo Please install Cloudflare Tunnel from:
    echo https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
    echo.
    pause
    exit /b 1
)

echo Starting Cloudflare Tunnel: ahrp-reports
echo.
echo Your services will be available at:
echo Frontend: https://your-domain.example.com
echo Backend API: https://api.your-domain.example.com
echo.
echo Press Ctrl+C to stop the tunnel
echo.

cloudflared tunnel run ahrp-reports

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start tunnel
    echo Make sure you have:
    echo 1. Created the tunnel: cloudflared tunnel create ahrp-reports
    echo 2. Configured DNS records in Cloudflare dashboard
    echo 3. Created config.yml file in ~/.cloudflared/
    echo.
    pause
)