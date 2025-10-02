-- AHRP Report System Configuration
Config = {}

-- Report System Settings
Config.ReportSystem = {
    -- Backend API URL
    apiUrl = "http://localhost:3001/api",
    
    -- API Key for FiveM server authentication
    apiKey = "your_fivem_server_key_here",
    
    -- Enable/disable features
    enableInGameReports = true,
    enableAnonymousReports = true,
    enableFileUploads = false, -- Screenshots can be uploaded via web interface
    
    -- Rate limiting
    cooldownTime = 300, -- 5 minutes between reports per player
    
    -- Default settings
    defaultPriority = "medium",
    
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

-- ESX Settings (if using ESX framework)
Config.ESX = {
    enabled = false, -- Set to true if using ESX
    getSharedObject = "esx:getSharedObject"
}

-- Notification Settings
Config.Notifications = {
    type = "default", -- Options: "default", "mythic", "pnotify", "okoknotify"
    position = "top-right",
    duration = 5000
}

-- Permission Settings
Config.Permissions = {
    -- Staff groups that can receive report notifications in-game
    staffGroups = {
        "admin",
        "moderator", 
        "support",
        "owner"
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