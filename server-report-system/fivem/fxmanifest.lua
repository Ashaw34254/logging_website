fx_version 'cerulean'
game 'gta5'

author 'AHRP Development Team'
description 'AHRP Report System - FiveM Integration'
version '1.0.0'

-- Client Scripts
client_scripts {
    'report_client.lua',
    'debug_report.lua'
}

-- Server Scripts
server_scripts {
    'report_server.lua',
    'test_installation.lua',
    'debug_permissions.lua'
}

-- Shared Scripts
shared_scripts {
    'config.lua'
}

-- UI Files (NUI interface)
ui_page 'html/index.html'
files {
    'html/index.html',
    'html/styles.css',
    'html/script.js'
}

-- Dependencies (all optional based on your server setup)
dependencies {
   -- 'es_extended',  -- Uncomment if using ESX framework
   -- 'qb-core',      -- Uncomment if using QBCore framework
   -- 'mythic_notify', -- Uncomment if using Mythic Notify
   -- 'pnotify',       -- Uncomment if using pNotify
   -- 'okokNotify'     -- Uncomment if using okokNotify
}