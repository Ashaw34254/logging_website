fx_version 'cerulean'
game 'gta5'

author 'AHRP Development Team'
description 'AHRP Report System - FiveM Integration'
version '1.0.0'

-- Client Scripts
client_scripts {
    'report_client.lua'
}

-- Server Scripts
server_scripts {
    'report_server.lua'
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

-- Dependencies
dependencies {
    'es_extended'  -- Optional: ESX framework support
}