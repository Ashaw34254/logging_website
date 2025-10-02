# 🚀 AHRP Report System - Quick Setup Checklist

## Pre-Setup Requirements
- [ ] Node.js (v16+) installed
- [ ] MySQL/MariaDB installed and running
- [ ] Discord account with server admin permissions
- [ ] (Optional) Cloudflare account for tunnel

## 1️⃣ Discord Application Setup
- [ ] Create Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] Copy Client ID and Client Secret
- [ ] Create bot user and copy bot token
- [ ] Set redirect URI: `http://localhost:3001/api/auth/discord/callback`
- [ ] Add bot to your Discord server with admin permissions
- [ ] Get channel IDs for reports, staff, alerts, logs channels

## 2️⃣ Database Setup
- [ ] Create MySQL database: `ahrp_reports`
- [ ] Run `docs/database-setup.sql` in MySQL
- [ ] Update `YOUR_DISCORD_ID_HERE` in the SQL script with your Discord ID
- [ ] Verify tables were created successfully

## 3️⃣ Backend Configuration
- [ ] Navigate to `server-report-system/backend/`
- [ ] Copy `.env.example` to `.env` (if exists) or update existing `.env`
- [ ] Fill in Discord credentials:
  - `DISCORD_CLIENT_ID=your_client_id`
  - `DISCORD_CLIENT_SECRET=your_client_secret`  
  - `DISCORD_BOT_TOKEN=your_bot_token`
- [ ] Fill in Discord channel IDs
- [ ] Update database credentials
- [ ] Generate secure keys for `SESSION_SECRET` and `JWT_SECRET`
- [ ] Run `npm install`

## 4️⃣ Frontend Configuration  
- [ ] Navigate to `server-report-system/frontend/`
- [ ] Update `.env` with API URL: `REACT_APP_API_URL=http://localhost:3001/api`
- [ ] Add Discord Client ID: `REACT_APP_DISCORD_CLIENT_ID=your_client_id`
- [ ] Run `npm install`

## 5️⃣ FiveM Configuration (Optional)
- [ ] Copy `server-report-system/fivem/` to your FiveM resources folder
- [ ] Update `config.lua` with your API URL and credentials
- [ ] Add Discord role IDs or staff identifiers
- [ ] Add `ensure ahrp-reports` to `server.cfg`
- [ ] Configure permissions in `server.cfg` using the example

## 6️⃣ Testing Local Setup
- [ ] Start backend: `cd server-report-system/backend && npm start`
- [ ] Start frontend: `cd server-report-system/frontend && npm start`
- [ ] Test backend health: Visit `http://localhost:3001/api/health`
- [ ] Test frontend: Visit `http://localhost:3000`
- [ ] Test Discord login: Visit `http://localhost:3000/login`
- [ ] Try Discord OAuth flow and verify user profile display
- [ ] Test logout functionality

## 7️⃣ FiveM Testing (If Applicable)
- [ ] Start your FiveM server with the resource
- [ ] Test `/report` command in-game
- [ ] Verify reports reach the web dashboard
- [ ] Test staff commands like `/reports`

## 8️⃣ Cloudflare Tunnel Setup (Production)
- [ ] Install cloudflared: `winget install --id Cloudflare.cloudflared`
- [ ] Follow `docs/CLOUDFLARE_SETUP_GUIDE.md`
- [ ] Update `.env` files with your domain
- [ ] Update Discord redirect URI with your domain
- [ ] Test with `start-all-with-tunnel.bat`

## 🔧 Automation Scripts Available
- `start-servers.bat` - Start backend + frontend locally
- `start-all-with-tunnel.bat` - Start everything + Cloudflare tunnel
- `stop-servers.bat` - Stop all running servers
- `restart-servers.bat` - Restart servers
- `status-check.bat` - Check if servers are running
- `troubleshoot.bat` - Diagnostic information

## 📚 Documentation Available
- `docs/CLOUDFLARE_SETUP_GUIDE.md` - Complete Cloudflare tunnel setup
- `docs/ENVIRONMENT_SETUP.md` - Detailed environment configuration
- `docs/FiveM_README.md` - FiveM integration guide
- `docs/BATCH_FILES_GUIDE.md` - Server automation guide

## 🚨 Common Issues
1. **Port conflicts**: Use `stop-servers.bat` to clean up
2. **Discord OAuth fails**: Check redirect URI matches exactly
3. **Database connection**: Verify MySQL is running and credentials are correct
4. **CORS errors**: Check `CORS_ORIGINS` in backend `.env`
5. **FiveM API errors**: Verify API URL is accessible from FiveM server

## ✅ Success Indicators
- Backend starts without errors on port 3001
- Frontend loads on port 3000 with AHRP branding
- Discord login works and shows user profile
- Database tables are created and populated
- FiveM `/report` command opens the interface
- All batch scripts work without errors

---

**Need Help?** Check the documentation in the `docs/` folder or review the troubleshooting sections in the setup guides.