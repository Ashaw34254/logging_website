# 🔧 Environment Configuration Guide

## Required Configuration Steps

### 1. Discord Application Setup

**Create Discord Application:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" 
3. Name it "AHRP Report System"
4. Go to "OAuth2" → "General"
5. Copy the Client ID and Client Secret

**Set Redirect URIs:**
- For local development: `http://localhost:3001/api/auth/discord/callback`
- For Cloudflare Tunnel: `https://api.your-domain.com/api/auth/discord/callback`

**Create Discord Bot:**
1. Go to "Bot" section in your Discord application
2. Click "Add Bot"
3. Copy the Bot Token
4. Enable these intents:
   - Message Content Intent
   - Server Members Intent

### 2. Backend .env Configuration

Update `server-report-system/backend/.env`:

```env
# Replace these placeholder values with real ones:

# Discord OAuth2 Configuration  
DISCORD_CLIENT_ID=your_actual_discord_client_id
DISCORD_CLIENT_SECRET=your_actual_discord_client_secret

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_actual_discord_bot_token
DISCORD_REPORTS_CHANNEL_ID=123456789012345678
DISCORD_STAFF_CHANNEL_ID=123456789012345679
DISCORD_ALERTS_CHANNEL_ID=123456789012345680
DISCORD_LOGS_CHANNEL_ID=123456789012345681

# Security Keys (Generate random strings)
SESSION_SECRET=generate_a_32_character_random_string
JWT_SECRET=generate_another_32_character_random_string

# Database Configuration (Update if needed)
DB_PASSWORD=your_actual_mysql_password

# Domain Configuration (For Cloudflare Tunnel)
DOMAIN=your-actual-domain.com
FRONTEND_DOMAIN=your-actual-domain.com
BACKEND_DOMAIN=api.your-actual-domain.com
DISCORD_REDIRECT_URI=https://api.your-actual-domain.com/api/auth/discord/callback
FRONTEND_URL=https://your-actual-domain.com
CORS_ORIGINS=http://localhost:3000,https://your-actual-domain.com,https://api.your-actual-domain.com
```

### 3. Frontend .env Configuration

Update `server-report-system/frontend/.env`:

```env
# API Configuration
REACT_APP_API_URL=https://api.your-actual-domain.com/api

# For local development use:
# REACT_APP_API_URL=http://localhost:3001/api

# Discord Configuration
REACT_APP_DISCORD_CLIENT_ID=your_actual_discord_client_id
```

### 4. FiveM Configuration

Update `server-report-system/fivem/config.lua`:

```lua
-- Update these with your actual values:
Config.API = {
    baseUrl = "https://api.your-actual-domain.com/api", -- Or http://localhost:3001/api for local
    apiKey = "ahrp_fivem_production_key_12345", -- Change this key
    timeout = 10000
}

-- Add your staff Discord role IDs:
Config.Permissions = {
    discordStaffRoles = {
        "123456789012345678", -- Admin role ID
        "123456789012345679", -- Moderator role ID  
        "123456789012345680"  -- Support role ID
    }
}
```

### 5. Generate Secure Keys

**For SESSION_SECRET and JWT_SECRET, generate random strings:**

```bash
# In PowerShell:
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# Or use online generator:
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

### 6. Discord Channel IDs

**To get Discord Channel IDs:**
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on channels → "Copy ID"
3. Use these IDs in your .env file

### 7. MySQL Database Setup

**Create the database:**
```sql
CREATE DATABASE ahrp_reports;
CREATE USER 'ahrp_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ahrp_reports.* TO 'ahrp_user'@'localhost';
FLUSH PRIVILEGES;
```

**Update .env with real database credentials:**
```env
DB_USER=ahrp_user
DB_PASSWORD=secure_password
```

## ⚠️ Security Notes

- Never commit real API keys, tokens, or passwords to git
- Use strong, unique passwords for database accounts
- Generate new SESSION_SECRET and JWT_SECRET for production
- Keep Discord bot token secure and never share it
- Use HTTPS in production (Cloudflare Tunnel handles this)

## 🧪 Testing Configuration

After updating configurations:

1. **Test Discord OAuth:**
   - Visit `/testing-login`
   - Try Discord login flow

2. **Test Backend:**
   - Visit `/api/health`
   - Check server logs for connection status

3. **Test Database:**
   - Backend should connect without errors
   - Check logs for database connection status

4. **Test FiveM Integration:**
   - Use `/report` command in-game
   - Check if reports reach the backend API