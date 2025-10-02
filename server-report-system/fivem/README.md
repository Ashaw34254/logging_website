# AHRP Report System - FiveM Integration

This FiveM resource provides in-game reporting functionality for the AHRP Report System. Players can submit reports directly from within the game, and staff members receive real-time notifications.

## Features

### Player Features
- **In-game report submission** with intuitive NUI interface
- **Multiple report types**: Player reports, bug reports, feedback
- **Categorized reporting** system with subcategories
- **Anonymous reporting** option
- **Real-time status updates** on submitted reports
- **Cooldown system** to prevent spam
- **Location tracking** for context

### Staff Features
- **Real-time notifications** for new reports
- **In-game report management** commands
- **Staff-only quick report** functionality
- **Report status updates** from in-game
- **Integration with permission systems** (ESX, ACE, QBCore)

### Technical Features
- **REST API integration** with web backend
- **Discord webhook notifications**
- **ESX and QBCore compatibility**
- **Configurable permission system**
- **Responsive NUI interface**
- **Automatic player data collection**

## Installation

### Prerequisites
1. FiveM server running Cfx.re
2. AHRP Report System backend API running
3. (Optional) ESX or QBCore framework

### Installation Steps

1. **Download the resource**
   ```bash
   git clone <repository-url> resources/ahrp-reports
   ```

2. **Configure the resource**
   - Edit `config.lua` with your server-specific settings
   - Update API endpoints and authentication keys
   - Configure Discord webhooks (optional)
   - Set up permission groups

3. **Add to server.cfg**
   ```cfg
   ensure ahrp-reports
   ```

4. **Restart your server**
   ```bash
   restart ahrp-reports
   ```

## Configuration

### Basic Configuration (`config.lua`)

```lua
Config = {
    -- Report System Settings
    ReportSystem = {
        enableInGameReports = true,
        apiUrl = "http://localhost:3000/api",
        apiKey = "your-api-key-here",
        cooldownTime = 60, -- seconds
        defaultPriority = "medium"
    },

    -- ESX Integration
    ESX = {
        enabled = true,
        getSharedObject = "esx:getSharedObject"
    },

    -- Permissions
    Permissions = {
        staffGroups = {"admin", "moderator", "support"},
        commands = {
            report = "user",
            reports = "staff",
            reportadmin = "admin"
        }
    }
}
```

### API Configuration
Ensure your backend API is running and accessible from the FiveM server. The resource will attempt to connect to the API on startup.

### Discord Webhooks (Optional)
Configure Discord webhooks in `config.lua` to receive notifications in Discord channels:

```lua
Config.Webhooks = {
    enabled = true,
    urls = {
        player_reports = "https://discord.com/api/webhooks/...",
        bug_reports = "https://discord.com/api/webhooks/...",
        feedback = "https://discord.com/api/webhooks/..."
    }
}
```

## Usage

### For Players

#### Commands
- `/report` - Open the report menu
- `/report player` - Open player report form
- `/report bug` - Open bug report form  
- `/feedback` - Open feedback form
- `/reportplayer` - Shortcut for player reports
- `/reportbug` - Shortcut for bug reports

#### Key Bindings
- **F7** - Open report menu (configurable)

#### Report Process
1. Use `/report` command or press F7
2. Select report type and category
3. Fill in required information
4. Submit the report
5. Receive confirmation with report ID
6. Get notified of status updates

### For Staff

#### Commands
- `/reports` - View recent reports
- `/reportadmin status [reportId] [status]` - Update report status
- `/quickreport [playerId] [reason]` - Quick staff report

#### Available Statuses
- `pending` - Newly submitted reports
- `in_progress` - Reports being investigated
- `resolved` - Completed reports
- `rejected` - Invalid or dismissed reports

#### Notifications
Staff members receive real-time notifications when:
- New reports are submitted
- Reports are assigned to them
- Report statuses change

## Integration

### ESX Framework
```lua
-- Check if player has ESX admin job
local ESX = exports["es_extended"]:getSharedObject()
local xPlayer = ESX.GetPlayerFromId(playerId)
local playerGroup = xPlayer.getGroup()
```

### QBCore Framework
```lua
-- Check if player has QBCore admin job
local QBCore = exports['qb-core']:GetCoreObject()
local Player = QBCore.Functions.GetPlayer(playerId)
local job = Player.PlayerData.job
```

### ACE Permissions
```lua
-- Check ACE permissions
if IsPlayerAceAllowed(playerId, "group.admin") then
    -- Player has admin permissions
end
```

## API Endpoints

The resource communicates with these API endpoints:

- `POST /api/reports/submit/fivem` - Submit new report
- `GET /api/reports` - Get reports list
- `PATCH /api/reports/:id/status` - Update report status
- `GET /api/health` - API health check

## File Structure

```
ahrp-reports/
├── fxmanifest.lua          # Resource manifest
├── config.lua              # Configuration file
├── report_client.lua       # Client-side script
├── report_server.lua       # Server-side script
└── html/                   # NUI Interface
    ├── index.html          # Main HTML file
    ├── styles.css          # Stylesheet
    └── script.js           # JavaScript logic
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend API is running
   - Verify API URL in config.lua
   - Check firewall settings

2. **Reports Not Submitting**
   - Verify API key configuration
   - Check server console for errors
   - Ensure proper permissions

3. **NUI Not Opening**
   - Check for JavaScript errors in F12 console
   - Verify file paths in fxmanifest.lua
   - Restart the resource

4. **Staff Notifications Not Working**
   - Check permission configuration
   - Verify staff group assignments
   - Test with `/reports` command

### Debugging

Enable verbose logging in `config.lua`:
```lua
Config.Debug = true
```

Check server console for detailed logs and error messages.

## Support

For support and bug reports:
1. Check the server console for error messages
2. Review configuration settings
3. Test API connectivity
4. Submit detailed bug reports with logs

## Version History

- **v1.0.0** - Initial release
  - Basic reporting functionality
  - NUI interface
  - Staff notifications
  - ESX/QBCore integration
  - Discord webhooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.