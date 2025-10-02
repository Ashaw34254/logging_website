# Cloudflare Tunnel Setup Guide for AHRP Report System

## Step 1: Install Cloudflare Tunnel

### Windows (PowerShell as Administrator):
```powershell
# Download and install cloudflared
winget install --id Cloudflare.cloudflared
```

### Alternative Windows Installation:
1. Download from: https://github.com/cloudflare/cloudflared/releases
2. Place `cloudflared.exe` in a folder in your PATH
3. Or add the folder to your system PATH

## Step 2: Login and Create Tunnel

```bash
# Login to Cloudflare
cloudflared tunnel login

# Create a new tunnel
cloudflared tunnel create ahrp-reports

# List your tunnels to verify
cloudflared tunnel list
```

## Step 3: Configure DNS Records

In your Cloudflare dashboard:

1. Go to DNS settings for your domain
2. Add these CNAME records:
   - Name: `@` (or your subdomain), Value: `<tunnel-id>.cfargotunnel.com`
   - Name: `api`, Value: `<tunnel-id>.cfargotunnel.com`

Replace `<tunnel-id>` with your actual tunnel ID from step 2.

## Step 4: Create Tunnel Configuration

Create file: `%USERPROFILE%\.cloudflared\config.yml`

```yaml
tunnel: ahrp-reports
credentials-file: C:\Users\%USERNAME%\.cloudflared\<tunnel-id>.json

ingress:
  # Frontend - Main domain
  - hostname: your-domain.example.com
    service: http://localhost:3000
  
  # Backend API - api subdomain
  - hostname: api.your-domain.example.com
    service: http://localhost:3001
  
  # Catch-all rule (required)
  - service: http_status:404
```

## Step 5: Update Environment Variables

### Backend (.env):
```env
# Replace 'your-domain.example.com' with your actual domain
DOMAIN=your-actual-domain.com
FRONTEND_DOMAIN=your-actual-domain.com
BACKEND_DOMAIN=api.your-actual-domain.com

DISCORD_REDIRECT_URI=https://api.your-actual-domain.com/api/auth/discord/callback
FRONTEND_URL=https://your-actual-domain.com
CORS_ORIGINS=http://localhost:3000,https://your-actual-domain.com,https://api.your-actual-domain.com

USE_CLOUDFLARE_TUNNEL=true
```

### Frontend (.env):
```env
REACT_APP_API_URL=https://api.your-actual-domain.com/api
```

## Step 6: Update Discord OAuth Settings

1. Go to Discord Developer Portal: https://discord.com/developers/applications
2. Select your application
3. Go to OAuth2 → General
4. Update Redirect URI to: `https://api.your-actual-domain.com/api/auth/discord/callback`
5. Save changes

## Step 7: Start Everything

### Option 1: Use the automated batch file
```cmd
start-all-with-tunnel.bat
```

### Option 2: Manual startup
```cmd
# Terminal 1: Backend
cd server-report-system\backend
npm start

# Terminal 2: Frontend  
cd server-report-system\frontend
npm start

# Terminal 3: Cloudflare Tunnel
cloudflared tunnel run ahrp-reports
```

## Step 8: Test Your Setup

1. **Local testing:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001/api/health

2. **Public testing:**
   - Frontend: https://your-actual-domain.com
   - Backend API: https://api.your-actual-domain.com/api/health
   - Discord Login: https://your-actual-domain.com/testing-login

## Troubleshooting

### Common Issues:

1. **CORS errors:**
   - Check CORS_ORIGINS in backend .env
   - Verify domain names match exactly

2. **Discord OAuth fails:**
   - Verify redirect URI in Discord settings
   - Check DISCORD_REDIRECT_URI in .env

3. **Tunnel not connecting:**
   - Verify tunnel exists: `cloudflared tunnel list`
   - Check config.yml file location and syntax
   - Ensure DNS records are correct

4. **SSL/Certificate issues:**
   - Cloudflare handles SSL automatically
   - Ensure USE_CLOUDFLARE_TUNNEL=true in backend .env

### Useful Commands:

```bash
# Check tunnel status
cloudflared tunnel info ahrp-reports

# Test tunnel configuration
cloudflared tunnel ingress validate

# View tunnel logs
cloudflared tunnel run ahrp-reports --loglevel debug

# Delete tunnel (if needed)
cloudflared tunnel delete ahrp-reports
```

## Security Benefits

✅ **Automatic HTTPS/SSL encryption**
✅ **DDoS protection via Cloudflare**
✅ **No need to open firewall ports**
✅ **Traffic analytics and caching**
✅ **Geographic load balancing**

Your local development servers remain secure behind the tunnel!