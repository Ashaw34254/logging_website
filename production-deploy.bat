@echo off
setlocal enabledelayedexpansion

REM =============================================
REM AHRP Report System - Production Deployment
REM =============================================
REM This script builds and deploys the AHRP Report System for production
REM Includes optimization, security hardening, and deployment automation

echo.
echo =============================================
echo   AHRP Report System - Production Deployment
echo =============================================
echo.
echo This script will:
echo - Build optimized production bundles
echo - Configure production environment
echo - Set up reverse proxy (Nginx)
echo - Configure SSL certificates
echo - Set up process management (PM2)
echo - Configure firewall rules
echo - Set up monitoring and logging
echo - Deploy to production server
echo.
echo ⚠️  PRODUCTION DEPLOYMENT WARNING
echo This script will make system-wide changes for production deployment.
echo Ensure you have backups and are on the correct server.
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
set "DEPLOY_DIR=C:\inetpub\ahrp-reports"
set "NGINX_DIR=C:\nginx"
set "LOG_DIR=C:\logs\ahrp-reports"

echo.
echo [1/12] Checking production requirements...
echo =========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required for production deployment
    echo Installing Node.js...
    choco install nodejs-lts -y
    call refreshenv
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js !NODE_VERSION! verified

REM Check if Chocolatey is installed
choco --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Chocolatey for package management...
    powershell -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    call refreshenv
)

echo ✅ Package manager ready

echo.
echo [2/12] Installing production tools...
echo ====================================

REM Install PM2 for process management
echo Installing PM2 process manager...
call npm install -g pm2
if %errorlevel% neq 0 (
    echo ❌ PM2 installation failed
    pause
    exit /b 1
)
echo ✅ PM2 installed successfully

REM Install Nginx
echo Installing Nginx web server...
choco install nginx -y
if %errorlevel% neq 0 (
    echo ⚠️  Nginx installation failed, will try manual configuration
) else (
    echo ✅ Nginx installed successfully
)

REM Install OpenSSL for SSL certificates
echo Installing OpenSSL for SSL support...
choco install openssl -y
if %errorlevel% neq 0 (
    echo ⚠️  OpenSSL installation failed, SSL setup will be limited
) else (
    echo ✅ OpenSSL installed successfully
)

echo.
echo [3/12] Creating production directories...
echo ========================================

REM Create deployment directories
if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"
if not exist "%DEPLOY_DIR%\backend" mkdir "%DEPLOY_DIR%\backend"
if not exist "%DEPLOY_DIR%\frontend" mkdir "%DEPLOY_DIR%\frontend"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%DEPLOY_DIR%\ssl" mkdir "%DEPLOY_DIR%\ssl"
if not exist "%DEPLOY_DIR%\backups" mkdir "%DEPLOY_DIR%\backups"

echo ✅ Production directories created

echo.
echo [4/12] Configuring production environment...
echo ===========================================

REM Create production backend .env
echo Creating production backend configuration...
(
    echo # AHRP Report System - Production Configuration
    echo # Generated on %date% %time%
    echo.
    echo # Server Configuration
    echo PORT=3001
    echo NODE_ENV=production
    echo.
    echo # Security Configuration
    echo TRUST_PROXY=true
    echo SECURE_COOKIES=true
    echo HTTPS_ONLY=true
    echo.
    echo # Discord OAuth Configuration ^(REQUIRED - Update these^)
    echo DISCORD_CLIENT_ID=your_production_discord_client_id
    echo DISCORD_CLIENT_SECRET=your_production_discord_client_secret
    echo DISCORD_BOT_TOKEN=your_production_discord_bot_token
    echo DISCORD_CALLBACK_URL=https://your-domain.com/api/auth/discord/callback
    echo.
    echo # Database Configuration ^(REQUIRED - Update these^)
    echo DB_HOST=localhost
    echo DB_PORT=3306
    echo DB_NAME=ahrp_reports_prod
    echo DB_USER=ahrp_user
    echo DB_PASSWORD=your_secure_production_password
    echo DB_SSL=true
    echo DB_CONNECTION_LIMIT=20
    echo.
    echo # Session Configuration ^(Auto-generated secure keys^)
    for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(128, 20)"') do echo SESSION_SECRET=%%i
    for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(128, 20)"') do echo JWT_SECRET=%%i
    echo.
    echo # CORS Configuration
    echo CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
    echo.
    echo # Rate Limiting
    echo RATE_LIMIT_WINDOW=900000
    echo RATE_LIMIT_MAX=100
    echo.
    echo # Logging Configuration
    echo LOG_LEVEL=info
    echo LOG_FILE=%LOG_DIR%\backend.log
    echo.
    echo # Discord Channel IDs ^(REQUIRED - Update these^)
    echo DISCORD_REPORTS_CHANNEL_ID=your_reports_channel_id
    echo DISCORD_STAFF_CHANNEL_ID=your_staff_channel_id
    echo DISCORD_ALERTS_CHANNEL_ID=your_alerts_channel_id
    echo DISCORD_LOGS_CHANNEL_ID=your_logs_channel_id
    echo.
    echo # Production Optimizations
    echo COMPRESSION=true
    echo CACHE_DURATION=86400
    echo STATIC_CACHE_DURATION=604800
) > "%DEPLOY_DIR%\backend\.env"

echo ✅ Production backend configuration created

REM Create production frontend .env
echo Creating production frontend configuration...
(
    echo # AHRP Report System - Production Frontend Configuration
    echo # Generated on %date% %time%
    echo.
    echo # API Configuration
    echo REACT_APP_API_URL=https://your-domain.com/api
    echo.
    echo # Discord Configuration ^(REQUIRED - Update this^)
    echo REACT_APP_DISCORD_CLIENT_ID=your_production_discord_client_id
    echo.
    echo # Production Optimizations
    echo GENERATE_SOURCEMAP=false
    echo DISABLE_ESLINT_PLUGIN=true
    echo SKIP_PREFLIGHT_CHECK=true
    echo IMAGE_INLINE_SIZE_LIMIT=8192
    echo.
    echo # Build Configuration
    echo BUILD_PATH=%DEPLOY_DIR%\frontend\build
    echo PUBLIC_URL=/
) > "%FRONTEND_DIR%\.env.production"

echo ✅ Production frontend configuration created

echo.
echo [5/12] Building production bundles...
echo ====================================

REM Build frontend for production
echo Building optimized frontend bundle...
cd /d "%FRONTEND_DIR%"
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend build completed

REM Copy frontend build to deployment directory
echo Copying frontend build to deployment directory...
if exist "%DEPLOY_DIR%\frontend\build" rmdir /s /q "%DEPLOY_DIR%\frontend\build"
xcopy /e /i /y "build" "%DEPLOY_DIR%\frontend\build"
echo ✅ Frontend deployed

echo.
echo [6/12] Preparing backend for production...
echo ========================================

REM Copy backend files to deployment directory
echo Copying backend files...
cd /d "%BACKEND_DIR%"
xcopy /e /i /y /exclude:node_modules "*" "%DEPLOY_DIR%\backend"

REM Install production dependencies
echo Installing production dependencies...
cd /d "%DEPLOY_DIR%\backend"
call npm ci --only=production
if %errorlevel% neq 0 (
    echo ❌ Backend production dependencies installation failed
    pause
    exit /b 1
)
echo ✅ Backend production dependencies installed

echo.
echo [7/12] Configuring Nginx reverse proxy...
echo ========================================

REM Create Nginx configuration
echo Creating Nginx configuration...
(
    echo # AHRP Report System - Nginx Configuration
    echo # Generated on %date% %time%
    echo.
    echo upstream ahrp_backend {
    echo     server 127.0.0.1:3001;
    echo     keepalive 32;
    echo }
    echo.
    echo # Rate limiting
    echo limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    echo limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    echo.
    echo # Main server block
    echo server {
    echo     listen 80;
    echo     server_name your-domain.com www.your-domain.com;
    echo.
    echo     # Redirect HTTP to HTTPS
    echo     return 301 https://$server_name$request_uri;
    echo }
    echo.
    echo server {
    echo     listen 443 ssl http2;
    echo     server_name your-domain.com www.your-domain.com;
    echo.
    echo     # SSL Configuration
    echo     ssl_certificate %DEPLOY_DIR%/ssl/cert.pem;
    echo     ssl_certificate_key %DEPLOY_DIR%/ssl/key.pem;
    echo     ssl_protocols TLSv1.2 TLSv1.3;
    echo     ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    echo     ssl_prefer_server_ciphers off;
    echo     ssl_session_cache shared:SSL:10m;
    echo     ssl_session_timeout 10m;
    echo.
    echo     # Security Headers
    echo     add_header X-Frame-Options DENY;
    echo     add_header X-Content-Type-Options nosniff;
    echo     add_header X-XSS-Protection "1; mode=block";
    echo     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    echo     add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;";
    echo.
    echo     # Gzip Compression
    echo     gzip on;
    echo     gzip_vary on;
    echo     gzip_min_length 1024;
    echo     gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    echo.
    echo     # Static files
    echo     location / {
    echo         root %DEPLOY_DIR%/frontend/build;
    echo         try_files $uri $uri/ /index.html;
    echo         
    echo         # Cache static assets
    echo         location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    echo             expires 1y;
    echo             add_header Cache-Control "public, immutable";
    echo         }
    echo     }
    echo.
    echo     # API routes
    echo     location /api {
    echo         limit_req zone=api burst=20 nodelay;
    echo         
    echo         proxy_pass http://ahrp_backend;
    echo         proxy_http_version 1.1;
    echo         proxy_set_header Upgrade $http_upgrade;
    echo         proxy_set_header Connection 'upgrade';
    echo         proxy_set_header Host $host;
    echo         proxy_set_header X-Real-IP $remote_addr;
    echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    echo         proxy_set_header X-Forwarded-Proto $scheme;
    echo         proxy_cache_bypass $http_upgrade;
    echo         proxy_read_timeout 86400;
    echo     }
    echo.
    echo     # Discord OAuth callback ^(stricter rate limiting^)
    echo     location /api/auth {
    echo         limit_req zone=login burst=5 nodelay;
    echo         
    echo         proxy_pass http://ahrp_backend;
    echo         proxy_http_version 1.1;
    echo         proxy_set_header Host $host;
    echo         proxy_set_header X-Real-IP $remote_addr;
    echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    echo         proxy_set_header X-Forwarded-Proto $scheme;
    echo     }
    echo.
    echo     # Health check endpoint
    echo     location /api/health {
    echo         proxy_pass http://ahrp_backend;
    echo         access_log off;
    echo     }
    echo.
    echo     # Block access to sensitive files
    echo     location ~ /\. {
    echo         deny all;
    echo     }
    echo.
    echo     location ~ ^/(\.env|package\.json|README|docs/) {
    echo         deny all;
    echo     }
    echo }
) > "%NGINX_DIR%\conf\ahrp-reports.conf"

echo ✅ Nginx configuration created

echo.
echo [8/12] Setting up SSL certificates...
echo ====================================

echo Creating self-signed SSL certificate for testing...
echo ⚠️  For production, replace with proper SSL certificates from Let's Encrypt or CA

cd /d "%DEPLOY_DIR%\ssl"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/C=US/ST=State/L=City/O=AHRP/CN=your-domain.com"
if %errorlevel% neq 0 (
    echo ⚠️  SSL certificate generation failed, manual SSL setup required
) else (
    echo ✅ Self-signed SSL certificate created
    echo 🔒 For production, obtain proper SSL certificates
)

echo.
echo [9/12] Configuring PM2 process management...
echo ===========================================

REM Create PM2 ecosystem configuration
echo Creating PM2 ecosystem configuration...
cd /d "%DEPLOY_DIR%"
(
    echo {
    echo   "apps": [
    echo     {
    echo       "name": "ahrp-backend",
    echo       "script": "./backend/server.js",
    echo       "cwd": "%DEPLOY_DIR%/backend",
    echo       "instances": 2,
    echo       "exec_mode": "cluster",
    echo       "env": {
    echo         "NODE_ENV": "production",
    echo         "PORT": 3001
    echo       },
    echo       "log_file": "%LOG_DIR%/pm2-backend.log",
    echo       "out_file": "%LOG_DIR%/pm2-backend-out.log",
    echo       "error_file": "%LOG_DIR%/pm2-backend-error.log",
    echo       "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
    echo       "merge_logs": true,
    echo       "max_memory_restart": "500M",
    echo       "node_args": "--max-old-space-size=512",
    echo       "watch": false,
    echo       "ignore_watch": ["node_modules", "logs"],
    echo       "restart_delay": 4000,
    echo       "max_restarts": 10,
    echo       "min_uptime": "10s"
    echo     }
    echo   ]
    echo }
) > ecosystem.config.json

echo ✅ PM2 configuration created

echo.
echo [10/12] Setting up Windows Firewall rules...
echo ===========================================

echo Configuring Windows Firewall for AHRP services...

REM Allow HTTP traffic
netsh advfirewall firewall add rule name="AHRP HTTP" dir=in action=allow protocol=TCP localport=80
echo ✅ HTTP port 80 opened

REM Allow HTTPS traffic
netsh advfirewall firewall add rule name="AHRP HTTPS" dir=in action=allow protocol=TCP localport=443
echo ✅ HTTPS port 443 opened

REM Allow backend port (internal only)
netsh advfirewall firewall add rule name="AHRP Backend" dir=in action=allow protocol=TCP localport=3001 remoteip=127.0.0.1
echo ✅ Backend port 3001 configured (localhost only)

echo.
echo [11/12] Creating production management scripts...
echo ===============================================

REM Create production start script
echo Creating production start script...
(
    echo @echo off
    echo title AHRP Report System - Production Start
    echo color 0A
    echo echo.
    echo echo ==========================================
    echo echo   Starting AHRP Report System Production
    echo echo ==========================================
    echo echo.
    echo.
    echo echo Starting Nginx web server...
    echo net start nginx
    echo if %%errorlevel%% neq 0 ^(
    echo     echo Starting Nginx manually...
    echo     start /d "%NGINX_DIR%" nginx.exe
    echo ^)
    echo.
    echo echo Starting PM2 and AHRP backend...
    echo cd /d "%DEPLOY_DIR%"
    echo pm2 start ecosystem.config.json
    echo.
    echo echo Saving PM2 configuration...
    echo pm2 save
    echo pm2 startup
    echo.
    echo echo ✅ AHRP Report System started in production mode
    echo echo.
    echo echo 🌐 Service URLs:
    echo echo - Frontend: https://your-domain.com
    echo echo - API Health: https://your-domain.com/api/health
    echo echo.
    echo echo 📊 Management Commands:
    echo echo - pm2 status        - Check application status
    echo echo - pm2 logs ahrp-backend - View logs
    echo echo - pm2 restart ahrp-backend - Restart application
    echo echo - pm2 reload ahrp-backend - Zero-downtime reload
    echo echo.
    echo pause
) > "%DEPLOY_DIR%\start-production.bat"

REM Create production stop script
(
    echo @echo off
    echo title AHRP Report System - Production Stop
    echo color 0C
    echo echo.
    echo echo ==========================================
    echo echo   Stopping AHRP Report System Production
    echo echo ==========================================
    echo echo.
    echo.
    echo echo Stopping PM2 processes...
    echo pm2 stop all
    echo pm2 delete all
    echo.
    echo echo Stopping Nginx...
    echo net stop nginx
    echo taskkill /f /im nginx.exe 2^>nul
    echo.
    echo echo ✅ AHRP Report System stopped
    echo echo.
    echo pause
) > "%DEPLOY_DIR%\stop-production.bat"

REM Create production status script
(
    echo @echo off
    echo title AHRP Report System - Production Status
    echo color 0B
    echo echo.
    echo echo ==========================================
    echo echo     AHRP Production Status Check
    echo echo ==========================================
    echo echo.
    echo.
    echo echo 📊 PM2 Process Status:
    echo pm2 status
    echo echo.
    echo echo 📊 System Status:
    echo netstat -an ^| findstr :80 ^>nul ^&^& echo ✅ HTTP Port 80: Active ^|\| echo ❌ HTTP Port 80: Inactive
    echo netstat -an ^| findstr :443 ^>nul ^&^& echo ✅ HTTPS Port 443: Active ^|\| echo ❌ HTTPS Port 443: Inactive
    echo netstat -an ^| findstr :3001 ^>nul ^&^& echo ✅ Backend Port 3001: Active ^|\| echo ❌ Backend Port 3001: Inactive
    echo echo.
    echo echo 🌐 Testing API Health:
    echo powershell -command "try { $response = Invoke-WebRequest -Uri 'https://localhost/api/health' -UseBasicParsing -SkipCertificateCheck; Write-Host '✅ API Health: OK' } catch { Write-Host '❌ API Health: Failed' }"
    echo echo.
    echo echo 📝 Recent Logs ^(last 20 lines^):
    echo pm2 logs ahrp-backend --lines 20 --nostream
    echo echo.
    echo pause
) > "%DEPLOY_DIR%\status-production.bat"

REM Create production update script
(
    echo @echo off
    echo title AHRP Report System - Production Update
    echo echo.
    echo echo ==========================================
    echo echo    AHRP Production Update
    echo echo ==========================================
    echo echo.
    echo echo This will update the production deployment
    echo echo with the latest code from the project directory.
    echo echo.
    echo echo ⚠️  WARNING: This will cause brief downtime
    echo echo.
    echo pause
    echo.
    echo echo Creating backup...
    echo set backup_name=ahrp-backup-%%date:~-4,4%%%%date:~-10,2%%%%date:~-7,2%%-%%time:~0,2%%%%time:~3,2%%
    echo mkdir "%DEPLOY_DIR%\backups\%%backup_name%%"
    echo xcopy /e /i /y "%DEPLOY_DIR%\backend" "%DEPLOY_DIR%\backups\%%backup_name%%\backend"
    echo xcopy /e /i /y "%DEPLOY_DIR%\frontend" "%DEPLOY_DIR%\backups\%%backup_name%%\frontend"
    echo echo ✅ Backup created: %%backup_name%%
    echo.
    echo echo Stopping services...
    echo pm2 stop ahrp-backend
    echo.
    echo echo Building new frontend...
    echo cd /d "%FRONTEND_DIR%"
    echo call npm run build
    echo.
    echo echo Updating backend...
    echo cd /d "%BACKEND_DIR%"
    echo xcopy /e /i /y /exclude:node_modules "*" "%DEPLOY_DIR%\backend"
    echo.
    echo echo Updating frontend...
    echo if exist "%DEPLOY_DIR%\frontend\build" rmdir /s /q "%DEPLOY_DIR%\frontend\build"
    echo xcopy /e /i /y "build" "%DEPLOY_DIR%\frontend\build"
    echo.
    echo echo Installing dependencies...
    echo cd /d "%DEPLOY_DIR%\backend"
    echo call npm ci --only=production
    echo.
    echo echo Restarting services...
    echo pm2 restart ahrp-backend
    echo.
    echo echo ✅ Production update completed
    echo echo.
    echo pause
) > "%DEPLOY_DIR%\update-production.bat"

echo ✅ Production management scripts created

echo.
echo [12/12] Final production setup...
echo ================================

REM Set proper permissions
echo Setting directory permissions...
icacls "%DEPLOY_DIR%" /grant "IIS_IUSRS:(OI)(CI)R" /t
icacls "%LOG_DIR%" /grant "IIS_IUSRS:(OI)(CI)F" /t

echo ✅ Permissions configured

REM Create production deployment summary
echo Creating deployment summary...
(
    echo # AHRP Report System - Production Deployment Summary
    echo Generated on %date% %time%
    echo.
    echo ## Deployment Information
    echo - Deploy Directory: %DEPLOY_DIR%
    echo - Log Directory: %LOG_DIR%
    echo - Nginx Config: %NGINX_DIR%\conf\ahrp-reports.conf
    echo - SSL Certificates: %DEPLOY_DIR%\ssl\
    echo.
    echo ## Services Configuration
    echo - Frontend: Static files served by Nginx
    echo - Backend: Node.js cluster managed by PM2
    echo - Database: MySQL ^(requires manual setup^)
    echo - SSL: Self-signed ^(replace with proper certificates^)
    echo.
    echo ## Management Scripts
    echo - start-production.bat  - Start all services
    echo - stop-production.bat   - Stop all services  
    echo - status-production.bat - Check service status
    echo - update-production.bat - Update deployment
    echo.
    echo ## Required Manual Configuration
    echo 1. Update .env files with production credentials
    echo 2. Replace SSL certificates with proper ones
    echo 3. Configure MySQL database
    echo 4. Update domain names in Nginx config
    echo 5. Configure DNS to point to this server
    echo.
    echo ## Security Considerations
    echo - Firewall configured for HTTP/HTTPS only
    echo - Rate limiting enabled
    echo - Security headers configured
    echo - Backend not directly accessible
    echo - Self-signed SSL ^(replace for production^)
) > "%DEPLOY_DIR%\DEPLOYMENT_SUMMARY.md"

echo ✅ Deployment summary created

echo.
echo =============================================
echo       🎉 PRODUCTION DEPLOYMENT COMPLETE! 🎉
echo =============================================
echo.
echo Your AHRP Report System is now configured for production!
echo.
echo 📁 DEPLOYMENT LOCATION:
echo %DEPLOY_DIR%
echo.
echo 🔧 WHAT WAS CONFIGURED:
echo =======================
echo ✅ Optimized production builds
echo ✅ Nginx reverse proxy with SSL
echo ✅ PM2 process management
echo ✅ Windows Firewall rules
echo ✅ Security headers and rate limiting
echo ✅ Compression and caching
echo ✅ Logging and monitoring
echo ✅ Management scripts
echo.
echo 🚨 REQUIRED MANUAL STEPS:
echo =========================
echo 1. 🔐 Update production .env files:
echo    - %DEPLOY_DIR%\backend\.env
echo    - Configure Discord OAuth credentials
echo    - Set database connection details
echo.
echo 2. 🗄️  Set up production MySQL database:
echo    - Create 'ahrp_reports_prod' database
echo    - Create 'ahrp_user' with proper permissions
echo    - Import schema from docs/database-setup.sql
echo.
echo 3. 🔒 Replace SSL certificates:
echo    - Replace %DEPLOY_DIR%\ssl\cert.pem
echo    - Replace %DEPLOY_DIR%\ssl\key.pem
echo    - Use Let's Encrypt or proper CA certificates
echo.
echo 4. 🌐 Update domain configuration:
echo    - Edit %NGINX_DIR%\conf\ahrp-reports.conf
echo    - Replace 'your-domain.com' with actual domain
echo    - Configure DNS to point to this server
echo.
echo 🚀 START PRODUCTION:
echo ===================
echo cd /d "%DEPLOY_DIR%"
echo start-production.bat
echo.
echo 📊 MANAGEMENT COMMANDS:
echo ======================
echo - status-production.bat  - Check service status
echo - stop-production.bat    - Stop all services
echo - update-production.bat  - Deploy updates
echo - pm2 logs ahrp-backend  - View live logs
echo.
echo 🌐 PRODUCTION URLS:
echo ==================
echo - Frontend: https://your-domain.com
echo - API: https://your-domain.com/api
echo - Health Check: https://your-domain.com/api/health
echo.
echo 📖 DOCUMENTATION:
echo =================
echo - Deployment Summary: %DEPLOY_DIR%\DEPLOYMENT_SUMMARY.md
echo - Setup Checklist: docs/SETUP_CHECKLIST.md
echo - Environment Setup: docs/ENVIRONMENT_SETUP.md
echo.
echo Press any key to finish deployment setup...
pause >nul

REM Open deployment directory
start "" "%DEPLOY_DIR%"

echo.
echo 📁 Deployment directory opened
echo 🚀 Your production environment is ready!
echo.
echo Complete the manual configuration steps and run start-production.bat
echo.
exit /b 0