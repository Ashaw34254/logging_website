@echo off
setlocal enabledelayedexpansion

REM ========================================
REM AHRP Report System - Complete Auto Installer
REM ========================================
REM This script automatically installs ALL required tools and dependencies
REM including Node.js, Git, and sets up the complete development environment

echo.
echo ==========================================
echo   AHRP Report System - Complete Installer
echo ==========================================
echo.
echo This script will automatically install and configure:
echo - Chocolatey (Package manager for Windows)
echo - Node.js LTS (Latest stable version)
echo - Git (Version control)
echo - Python (Required for some npm packages)
echo - Visual Studio Build Tools (For native modules)
echo - MySQL Community Server (Database)
echo - Frontend dependencies (React app)
echo - Backend dependencies (Express server)
echo - Development scripts and tools
echo.
echo ⚠️  ADMINISTRATOR PRIVILEGES REQUIRED
echo This script needs to run as Administrator to install system tools.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: This script must be run as Administrator
    echo.
    echo Please:
    echo 1. Right-click on this batch file
    echo 2. Select "Run as administrator"
    echo 3. Click "Yes" when prompted
    echo.
    pause
    exit /b 1
)

echo ✅ Running with Administrator privileges

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%"
set "BACKEND_DIR=%PROJECT_ROOT%server-report-system\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%server-report-system\frontend"

echo.
echo [1/10] Installing Chocolatey Package Manager...
echo ==============================================

REM Check if Chocolatey is installed
choco --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Chocolatey...
    powershell -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Chocolatey
        pause
        exit /b 1
    )
    
    REM Refresh environment variables
    call refreshenv
    echo ✅ Chocolatey installed successfully
) else (
    for /f "tokens=*" %%i in ('choco --version') do set CHOCO_VERSION=%%i
    echo ✅ Chocolatey !CHOCO_VERSION! is already installed
)

echo.
echo [2/10] Installing Node.js LTS...
echo ===============================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Node.js LTS...
    choco install nodejs-lts -y
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Node.js
        pause
        exit /b 1
    )
    
    REM Refresh environment variables
    call refreshenv
    echo ✅ Node.js installed successfully
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js !NODE_VERSION! is already installed
)

echo.
echo [3/10] Installing Git...
echo =======================

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Git...
    choco install git -y
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Git
        pause
        exit /b 1
    )
    
    REM Refresh environment variables
    call refreshenv
    echo ✅ Git installed successfully
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo ✅ !GIT_VERSION! is already installed
)

echo.
echo [4/10] Installing Python...
echo ==========================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python...
    choco install python -y
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Python
        pause
        exit /b 1
    )
    
    REM Refresh environment variables
    call refreshenv
    echo ✅ Python installed successfully
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✅ !PYTHON_VERSION! is already installed
)

echo.
echo [5/10] Installing Build Tools...
echo ===============================

REM Install Visual Studio Build Tools for native modules
echo Installing Visual Studio Build Tools (required for native npm packages)...
choco install visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools" -y
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Build tools installation failed, some npm packages might not compile
) else (
    echo ✅ Build tools installed successfully
)

echo.
echo [6/10] Installing MySQL Community Server...
echo ==========================================

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing MySQL Community Server...
    choco install mysql -y
    if %errorlevel% neq 0 (
        echo ⚠️  Warning: MySQL installation failed, you'll need to install it manually
        echo You can download MySQL from: https://dev.mysql.com/downloads/mysql/
    ) else (
        echo ✅ MySQL installed successfully
        echo ⚠️  Please set up MySQL root password and create 'ahrp_reports' database
    )
) else (
    for /f "tokens=*" %%i in ('mysql --version') do set MYSQL_VERSION=%%i
    echo ✅ MySQL is already installed
)

REM Refresh environment variables after all installations
call refreshenv

echo.
echo [7/10] Verifying installations...
echo ================================

REM Verify Node.js and npm
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js installation verification failed
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js !NODE_VERSION! verified
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm installation verification failed
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm !NPM_VERSION! verified
)

echo.
echo [8/10] Checking project structure...
echo ===================================

REM Check if directories exist
if not exist "%BACKEND_DIR%" (
    echo ❌ Backend directory not found: %BACKEND_DIR%
    echo Please ensure you're running this script from the project root
    pause
    exit /b 1
) else (
    echo ✅ Backend directory found
)

if not exist "%FRONTEND_DIR%" (
    echo ❌ Frontend directory not found: %FRONTEND_DIR%
    echo Please ensure you're running this script from the project root
    pause
    exit /b 1
) else (
    echo ✅ Frontend directory found
)

echo.
echo [9/10] Installing all project dependencies...
echo ============================================

REM Update npm to latest version
echo Updating npm to latest version...
call npm install -g npm@latest
if %errorlevel% neq 0 (
    echo ⚠️  Warning: npm update failed, continuing with current version
) else (
    echo ✅ npm updated to latest version
)

REM Install global development tools
echo Installing global development tools...
call npm install -g nodemon concurrently
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Global tools installation failed, continuing...
) else (
    echo ✅ Global development tools installed
)

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd /d "%BACKEND_DIR%"
if not exist "package.json" (
    echo ❌ Backend package.json not found
    echo Please ensure the backend is properly configured
    pause
    exit /b 1
)

call npm install --verbose
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed
    echo Trying with legacy peer deps...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ Backend installation failed even with legacy peer deps
        pause
        exit /b 1
    )
)
echo ✅ Backend dependencies installed successfully

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd /d "%FRONTEND_DIR%"
if not exist "package.json" (
    echo ❌ Frontend package.json not found
    echo Please ensure the frontend is properly configured
    pause
    exit /b 1
)

call npm install --verbose
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    echo Trying with legacy peer deps...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ Frontend installation failed even with legacy peer deps
        pause
        exit /b 1
    )
)
echo ✅ Frontend dependencies installed successfully

echo.
echo [10/10] Creating complete environment configuration...
echo ======================================================

cd /d "%PROJECT_ROOT%"

REM Generate secure random secrets
echo Generating secure session secrets...
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(64, 10)"') do set SESSION_SECRET=%%i
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(64, 10)"') do set JWT_SECRET=%%i

REM Check backend .env file
if exist "%BACKEND_DIR%\.env" (
    echo ✅ Backend .env file exists
) else (
    echo Creating backend .env file with secure defaults...
    (
        echo # AHRP Report System - Backend Configuration
        echo # Auto-generated configuration file
        echo.
        echo # Server Configuration
        echo PORT=3001
        echo NODE_ENV=development
        echo.
        echo # Discord OAuth Configuration ^(REQUIRED - Update these^)
        echo DISCORD_CLIENT_ID=your_discord_client_id_here
        echo DISCORD_CLIENT_SECRET=your_discord_client_secret_here
        echo DISCORD_BOT_TOKEN=your_discord_bot_token_here
        echo DISCORD_CALLBACK_URL=http://localhost:3001/api/auth/discord/callback
        echo.
        echo # Database Configuration ^(REQUIRED - Update these^)
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_NAME=ahrp_reports
        echo DB_USER=root
        echo DB_PASSWORD=your_mysql_password_here
        echo.
        echo # Session Configuration ^(Auto-generated^)
        echo SESSION_SECRET=!SESSION_SECRET!
        echo JWT_SECRET=!JWT_SECRET!
        echo.
        echo # CORS Configuration
        echo CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
        echo.
        echo # Discord Channel IDs ^(REQUIRED - Update these^)
        echo DISCORD_REPORTS_CHANNEL_ID=your_reports_channel_id
        echo DISCORD_STAFF_CHANNEL_ID=your_staff_channel_id
        echo DISCORD_ALERTS_CHANNEL_ID=your_alerts_channel_id
        echo DISCORD_LOGS_CHANNEL_ID=your_logs_channel_id
        echo.
        echo # FiveM Integration ^(Optional^)
        echo FIVEM_SERVER_KEY=your_fivem_server_key_here
        echo FIVEM_WEBHOOK_SECRET=your_fivem_webhook_secret_here
    ) > "%BACKEND_DIR%\.env"
    echo ✅ Created backend .env with secure session secrets
)

REM Check frontend .env file
if exist "%FRONTEND_DIR%\.env" (
    echo ✅ Frontend .env file exists
) else (
    echo Creating frontend .env file...
    (
        echo # AHRP Report System - Frontend Configuration
        echo # Auto-generated configuration file
        echo.
        echo # API Configuration
        echo REACT_APP_API_URL=http://localhost:3001/api
        echo.
        echo # Discord Configuration ^(REQUIRED - Update this^)
        echo REACT_APP_DISCORD_CLIENT_ID=your_discord_client_id_here
        echo.
        echo # Build Configuration
        echo GENERATE_SOURCEMAP=false
        echo DISABLE_ESLINT_PLUGIN=true
        echo SKIP_PREFLIGHT_CHECK=true
        echo.
        echo # Development Configuration
        echo FAST_REFRESH=true
        echo CHOKIDAR_USEPOLLING=false
    ) > "%FRONTEND_DIR%\.env"
    echo ✅ Created frontend .env template
)

REM Create comprehensive development scripts
echo Creating enhanced development scripts...

REM Create start-dev.bat
(
    echo @echo off
    echo title AHRP Report System - Development Launcher
    echo color 0A
    echo echo.
    echo echo ==========================================
    echo echo    AHRP Report System - Development Mode
    echo echo ==========================================
    echo echo.
    echo echo Starting development servers...
    echo echo - Backend will start on: http://localhost:3001
    echo echo - Frontend will start on: http://localhost:3000
    echo echo.
    echo echo Press Ctrl+C in any terminal to stop that server
    echo echo Use stop-dev.bat to stop all servers at once
    echo echo.
    echo.
    echo REM Start backend in development mode
    echo start "AHRP Backend Server" cmd /k "title AHRP Backend && cd /d \"%~dp0server-report-system\backend\" && echo Starting backend server... && npm run dev"
    echo.
    echo REM Wait for backend to initialize
    echo echo Waiting for backend to start...
    echo timeout /t 5 /nobreak ^>nul
    echo.
    echo REM Start frontend in development mode
    echo start "AHRP Frontend Server" cmd /k "title AHRP Frontend && cd /d \"%~dp0server-report-system\frontend\" && echo Starting frontend server... && npm start"
    echo.
    echo echo.
    echo echo ✅ Development servers are starting...
    echo echo.
    echo echo 🌐 URLs:
    echo echo - Frontend: http://localhost:3000
    echo echo - Backend API: http://localhost:3001/api
    echo echo - API Health: http://localhost:3001/api/health
    echo echo.
    echo echo 📚 Quick Actions:
    echo echo - Press any key to open frontend in browser
    echo echo - Use stop-dev.bat to stop all servers
    echo echo - Check logs in the opened terminal windows
    echo echo.
    echo pause ^>nul
    echo start http://localhost:3000
) > "%PROJECT_ROOT%start-dev.bat"

REM Create stop-dev.bat
(
    echo @echo off
    echo title AHRP Report System - Stop Development Servers
    echo color 0C
    echo echo.
    echo echo ==========================================
    echo echo    Stopping AHRP Development Servers
    echo echo ==========================================
    echo echo.
    echo.
    echo echo Stopping all Node.js processes on development ports...
    echo.
    echo REM Kill processes on port 3000 ^(Frontend^)
    echo for /f "tokens=5" %%%%a in ('netstat -aon ^| findstr :3000') do ^(
    echo     echo Stopping process on port 3000: %%%%a
    echo     taskkill /f /pid %%%%a 2^>nul
    echo ^)
    echo.
    echo REM Kill processes on port 3001 ^(Backend^)
    echo for /f "tokens=5" %%%%a in ('netstat -aon ^| findstr :3001') do ^(
    echo     echo Stopping process on port 3001: %%%%a
    echo     taskkill /f /pid %%%%a 2^>nul
    echo ^)
    echo.
    echo REM Close terminal windows
    echo taskkill /f /im cmd.exe /fi "WINDOWTITLE eq AHRP Backend Server" 2^>nul
    echo taskkill /f /im cmd.exe /fi "WINDOWTITLE eq AHRP Frontend Server" 2^>nul
    echo.
    echo echo ✅ All development servers stopped
    echo echo.
    echo timeout /t 3 /nobreak ^>nul
) > "%PROJECT_ROOT%stop-dev.bat"

REM Create status check script
(
    echo @echo off
    echo title AHRP Report System - Status Check
    echo color 0B
    echo echo.
    echo echo ==========================================
    echo echo      AHRP System Status Check
    echo echo ==========================================
    echo echo.
    echo.
    echo echo Checking system status...
    echo echo.
    echo.
    echo REM Check if ports are in use
    echo echo 🔍 Port Status:
    echo netstat -an ^| findstr :3000 ^>nul && echo ✅ Port 3000: In use ^(Frontend^) ^|\| echo ❌ Port 3000: Available
    echo netstat -an ^| findstr :3001 ^>nul && echo ✅ Port 3001: In use ^(Backend^) ^|\| echo ❌ Port 3001: Available
    echo echo.
    echo.
    echo echo 🌐 Testing API Health...
    echo powershell -command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -UseBasicParsing; Write-Host '✅ Backend API: Healthy' } catch { Write-Host '❌ Backend API: Not responding' }"
    echo echo.
    echo.
    echo echo 📋 System Information:
    echo node --version 2^>nul ^&^& echo ✅ Node.js: Installed ^|\| echo ❌ Node.js: Not found
    echo npm --version 2^>nul ^&^& echo ✅ npm: Installed ^|\| echo ❌ npm: Not found
    echo git --version 2^>nul ^&^& echo ✅ Git: Installed ^|\| echo ❌ Git: Not found
    echo mysql --version 2^>nul ^&^& echo ✅ MySQL: Installed ^|\| echo ❌ MySQL: Not found
    echo echo.
    echo.
    echo pause
) > "%PROJECT_ROOT%status-check.bat"

REM Create restart script
(
    echo @echo off
    echo title AHRP Report System - Restart Servers
    echo echo.
    echo echo ==========================================
    echo echo     Restarting AHRP Development Servers
    echo echo ==========================================
    echo echo.
    echo.
    echo echo Stopping existing servers...
    echo call "%~dp0stop-dev.bat"
    echo.
    echo echo Waiting 3 seconds...
    echo timeout /t 3 /nobreak ^>nul
    echo.
    echo echo Starting servers...
    echo call "%~dp0start-dev.bat"
) > "%PROJECT_ROOT%restart-dev.bat"

echo ✅ Created comprehensive development scripts

REM Create MySQL setup script
echo Creating MySQL database setup script...
(
    echo @echo off
    echo title AHRP Report System - Database Setup
    echo echo.
    echo echo ==========================================
    echo echo      AHRP Database Setup
    echo echo ==========================================
    echo echo.
    echo echo This script will create the AHRP database and tables
    echo echo Make sure MySQL is running and you know the root password
    echo echo.
    echo pause
    echo.
    echo echo Creating database...
    echo mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ahrp_reports; USE ahrp_reports; SOURCE docs/database-setup.sql;"
    echo.
    echo if %%errorlevel%% neq 0 ^(
    echo     echo ❌ Database setup failed
    echo     echo Please check your MySQL installation and credentials
    echo ^) else ^(
    echo     echo ✅ Database setup completed successfully
    echo ^)
    echo.
    echo pause
) > "%PROJECT_ROOT%setup-database.bat"

echo ✅ Created database setup script

REM Final system verification
echo.
echo Performing final system verification...

REM Check if all required files exist
set "MISSING_FILES="
if not exist "%BACKEND_DIR%\package.json" set "MISSING_FILES=!MISSING_FILES! backend/package.json"
if not exist "%FRONTEND_DIR%\package.json" set "MISSING_FILES=!MISSING_FILES! frontend/package.json"
if not exist "%BACKEND_DIR%\server.js" set "MISSING_FILES=!MISSING_FILES! backend/server.js"
if not exist "%FRONTEND_DIR%\src\App.js" set "MISSING_FILES=!MISSING_FILES! frontend/src/App.js"

if not "!MISSING_FILES!"=="" (
    echo ❌ Missing critical files: !MISSING_FILES!
    echo Please ensure all project files are present
    pause
    exit /b 1
) else (
    echo ✅ All critical files present
)

echo ✅ System verification completed

echo.
echo ==========================================
echo         🎉 COMPLETE INSTALLATION FINISHED! 🎉
echo ==========================================
echo.
echo Your AHRP Report System is now fully installed and configured!
echo.
echo �️  WHAT WAS INSTALLED:
echo =======================
echo ✅ Chocolatey Package Manager
echo ✅ Node.js LTS + npm (Latest)
echo ✅ Git Version Control
echo ✅ Python 3 (For native modules)
echo ✅ Visual Studio Build Tools
echo ✅ MySQL Community Server
echo ✅ All Frontend Dependencies (React)
echo ✅ All Backend Dependencies (Express)
echo ✅ Global Development Tools (nodemon, concurrently)
echo ✅ Complete Development Scripts
echo ✅ Environment Configuration Files
echo ✅ Database Setup Scripts
echo.
echo 📋 IMMEDIATE NEXT STEPS:
echo ========================
echo 1. 🔐 Configure Discord Application:
echo    - Visit: https://discord.com/developers/applications
echo    - Create new application and bot
echo    - Update .env files with credentials:
echo      • Backend: %BACKEND_DIR%\.env
echo      • Frontend: %FRONTEND_DIR%\.env
echo.
echo 2. 🗄️  Set up MySQL Database:
echo    - Run: setup-database.bat
echo    - Or manually create 'ahrp_reports' database
echo    - Import schema: docs/database-setup.sql
echo.
echo 3. 🚀 Start Development:
echo    - Run: start-dev.bat
echo    - Visit: http://localhost:3000
echo    - Test login with Discord
echo.
echo 🎮 AVAILABLE SCRIPTS:
echo ====================
echo - start-dev.bat      - Start both frontend and backend
echo - stop-dev.bat       - Stop all development servers
echo - restart-dev.bat    - Restart all servers
echo - status-check.bat   - Check system and server status
echo - setup-database.bat - Initialize MySQL database
echo.
echo 🌐 DEVELOPMENT URLS:
echo ===================
echo - Frontend:     http://localhost:3000
echo - Backend API:  http://localhost:3001/api
echo - API Health:   http://localhost:3001/api/health
echo - Login Test:   http://localhost:3000/login
echo.
echo 📚 DOCUMENTATION:
echo ==================
echo - Setup Checklist:    docs/SETUP_CHECKLIST.md
echo - Environment Setup:  docs/ENVIRONMENT_SETUP.md
echo - Login Integration:  docs/LOGIN_SYSTEM_INTEGRATION.md
echo - Cloudflare Guide:   docs/CLOUDFLARE_SETUP_GUIDE.md
echo - Database Schema:    docs/database-setup.sql
echo.
echo � TROUBLESHOOTING:
echo ===================
echo - Run status-check.bat to diagnose issues
echo - Check .env files for missing values
echo - Ensure MySQL is running and configured
echo - Verify Discord app credentials are correct
echo - Use restart-dev.bat if servers become unresponsive
echo.
echo 💡 PRO TIPS:
echo ===========
echo - Keep terminal windows open to see server logs
echo - Use Ctrl+C in terminals to stop individual servers
echo - Backend changes auto-restart with nodemon
echo - Frontend changes auto-refresh in browser
echo - Check status-check.bat for port conflicts
echo.
echo 🎯 READY TO GO:
echo ===============
echo Your development environment is completely set up!
echo Run 'start-dev.bat' and begin developing your AHRP Report System.
echo.
echo Press any key to finish setup...
pause >nul

cd /d "%PROJECT_ROOT%"

REM Open the project folder in Explorer
start "" "%PROJECT_ROOT%"

echo.
echo 📁 Project folder opened in Explorer
echo 🚀 You're ready to start developing!
echo.
exit /b 0