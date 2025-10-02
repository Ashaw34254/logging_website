-- AHRP Report System Configuration
Config = {}

-- Report System Settings
Config.ReportSystem = {
    -- Backend API URL (change this to match your backend server)
    apiUrl = "http://localhost:3001/api",
    
    -- API Key for FiveM server authentication
    -- Generate a secure API key and add it to your backend .env file as FIVEM_API_KEY
    apiKey = "your_fivem_server_key_here",
    
    -- Enable/disable features
    enableInGameReports = true,
    enableAnonymousReports = true,
    enableFileUploads = false, -- Screenshots can be uploaded via web interface
    enableStaffNotifications = true, -- In-game notifications for staff
    enableAutoAssignment = true, -- Automatically assign reports to available staff
    
    -- Rate limiting
    cooldownTime = 300, -- 5 minutes between reports per player
    maxReportsPerHour = 5, -- Maximum reports per player per hour
    
    -- Default settings
    defaultPriority = "medium",
    
    -- Report validation
    minDescriptionLength = 10,
    maxDescriptionLength = 2000,
    
    -- Report categories and subcategories
    categories = {
        player_report = {
            label = "Player Report",
            subcategories = {
                "RDM (Random Death Match)",
                "VDM (Vehicle Death Match)",
                "Metagaming",
                "Powergaming",
                "FailRP",
                "Exploiting",
                "Harassment",
                "Cheating/Hacking",
                "Rule Breaking",
                "Other"
            }
        },
        bug_report = {
            label = "Bug Report",
            subcategories = {
                "Vehicle Issues",
                "Job/Script Issues",
                "Map/World Issues",
                "Performance Issues",
                "UI/HUD Issues",
                "Economy Issues",
                "Other"
            }
        },
        feedback = {
            label = "Feedback",
            subcategories = {
                "Feature Request",
                "Improvement Suggestion",
                "General Feedback",
                "Server Performance",
                "Economy Balance",
                "Job Balance",
                "Other"
            }
        }
    }
}

-- Framework Settings
Config.Framework = {
    type = "standalone", -- Options: "standalone", "esx", "qbcore", "custom"
    esxSharedObject = "esx:getSharedObject", -- Only used if type = "esx"
    qbcoreExport = "qb-core" -- Only used if type = "qbcore"
}

-- Notification Settings
Config.Notifications = {
    type = "default", -- Options: "default", "mythic", "pnotify", "okoknotify"
    position = "top-right",
    duration = 5000
}

-- Permission Settings
Config.Permissions = {
    -- Staff identification method
    method = "ace", -- Options: "ace", "discord", "steam", "license", "custom"
    
    -- Staff groups/roles for ACE permissions
    staffGroups = {
        "admin",
        "moderator", 
        "support",
        "owner"
    },
    
    -- Staff Discord role IDs (if using discord method)
    discordStaffRoles = {
        "123456789012345678", -- Admin role ID
        "123456789012345679", -- Moderator role ID
        "123456789012345680"  -- Support role ID
    },
    
    -- Staff Steam/License IDs (if using steam/license method)
    staffIdentifiers = {
        -- "steam:110000100000000",
        -- "license:abc123def456"
    },
    
    -- Commands and their required permissions
    commands = {
        report = "user", -- Everyone can use /report
        reports = "support", -- View reports command
        reportadmin = "moderator" -- Admin report commands
    }
}

-- Webhook Settings (for Discord notifications)
Config.Webhooks = {
    enabled = true,
    
    -- Different webhooks for different report types
    urls = {
        player_reports = "https://discord.com/api/webhooks/your_player_reports_webhook",
        bug_reports = "https://discord.com/api/webhooks/your_bug_reports_webhook",
        feedback = "https://discord.com/api/webhooks/your_feedback_webhook"
    },
    
    -- Webhook settings
    botName = "AHRP Report System",
    avatar = "https://i.imgur.com/your_bot_avatar.png"
}

-- UI Settings
Config.UI = {
    -- Key to open report menu (if using NUI)
    openKey = "F7",
    
    -- Theme colors
    theme = {
        primary = "#3b82f6",
        success = "#22c55e",
        warning = "#f59e0b",
        danger = "#ef4444"
    }
}