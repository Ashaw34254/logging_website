# Cloudflare Tunnel Configuration for AHRP Report System

## Prerequisites
1. Install Cloudflare Tunnel (cloudflared): https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
2. Login to Cloudflare: `cloudflared tunnel login`
3. Create a tunnel: `cloudflared tunnel create ahrp-reports`

## Configuration Steps

### 1. Create tunnel configuration file (config.yml)
Create a file at `~/.cloudflared/config.yml` (Windows: `%USERPROFILE%\.cloudflared\config.yml`) with:

```yaml
tunnel: ahrp-reports
credentials-file: /path/to/your/tunnel/credentials.json

ingress:
  # Frontend - Main domain
  - hostname: your-domain.example.com
    service: http://localhost:3000
  
  # Backend API - Subdomain
  - hostname: api.your-domain.example.com
    service: http://localhost:3001
  
  # Catch-all rule (required)
  - service: http_status:404
```

### 2. DNS Records
Add these DNS records in your Cloudflare dashboard:
- `your-domain.example.com` CNAME to `<tunnel-id>.cfargotunnel.com`
- `api.your-domain.example.com` CNAME to `<tunnel-id>.cfargotunnel.com`

### 3. Update Environment Variables
Replace 'your-domain.example.com' in your .env file with your actual domain.

### 4. Discord OAuth Configuration
Update your Discord application OAuth settings:
- Redirect URI: `https://api.your-domain.example.com/api/auth/discord/callback`

### 5. Start Services
1. Start your backend: `npm start` (in backend directory)
2. Start your frontend: `npm start` (in frontend directory)  
3. Start Cloudflare tunnel: `cloudflared tunnel run ahrp-reports`

## Batch Scripts for Easy Management

### start-tunnel.bat
```batch
@echo off
echo Starting Cloudflare Tunnel for AHRP Reports...
cloudflared tunnel run ahrp-reports
```

### start-all-with-tunnel.bat
```batch
@echo off
echo Starting AHRP Report System with Cloudflare Tunnel...

echo Starting backend server...
cd server-report-system\backend
start "Backend" npm start

echo Starting frontend server...
cd ..\frontend
start "Frontend" npm start

echo Starting Cloudflare Tunnel...
cd ..\..
start "Tunnel" cloudflared tunnel run ahrp-reports

echo All services started!
echo Frontend: https://your-domain.example.com
echo Backend API: https://api.your-domain.example.com
echo Local Frontend: http://localhost:3000
echo Local Backend: http://localhost:3001

pause
```

## Testing
1. Access your frontend at: `https://your-domain.example.com`
2. Test API at: `https://api.your-domain.example.com/api/health`
3. Test Discord login at: `https://your-domain.example.com/testing-login`

## Security Notes
- Cloudflare provides automatic HTTPS/SSL
- Your local servers remain protected behind the tunnel
- Only specified ports/services are exposed
- Built-in DDoS protection and caching