-- AHRP Report System - Client Side
local isReportMenuOpen = false
local lastReportTime = 0
local playerData = {}

-- Initialize
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000)
        
        -- Get player data periodically
        local playerId = PlayerId()
        local playerPed = PlayerPedId()
        local playerName = GetPlayerName(playerId)
        local playerCoords = GetEntityCoords(playerPed)
        
        playerData = {
            serverId = GetPlayerServerId(playerId),
            name = playerName,
            coords = {
                x = math.floor(playerCoords.x),
                y = math.floor(playerCoords.y),
                z = math.floor(playerCoords.z)
            },
            vehicle = IsPedInAnyVehicle(playerPed, false) and GetDisplayNameFromVehicleModel(GetEntityModel(GetVehiclePedIsIn(playerPed, false))) or nil
        }
    end
end)

-- Report command
RegisterCommand('report', function(source, args, rawCommand)
    -- Check cooldown
    local currentTime = GetGameTimer()
    if (currentTime - lastReportTime) < (Config.ReportSystem.cooldownTime * 1000) then
        local remainingTime = math.ceil((Config.ReportSystem.cooldownTime * 1000 - (currentTime - lastReportTime)) / 1000)
        ShowNotification('Please wait ' .. remainingTime .. ' seconds before submitting another report.', 'error')
        return
    end
    
    if #args > 0 then
        -- Quick report with command arguments
        local reportText = table.concat(args, ' ')
        OpenQuickReportDialog(reportText)
    else
        -- Open full report menu
        OpenReportMenu()
    end
end, false)

-- Quick report dialog for command usage
function OpenQuickReportDialog(initialText)
    -- Simple input dialog for quick reports
    local input = {
        {
            type = 'input',
            label = 'Report Type',
            placeholder = 'player_report, bug_report, or feedback',
            required = true
        },
        {
            type = 'input',
            label = 'Category',
            placeholder = 'e.g., RDM, VDM, Bug, etc.',
            required = true
        },
        {
            type = 'input',
            label = 'Target Player ID (optional)',
            placeholder = 'Player ID if reporting another player',
            required = false
        },
        {
            type = 'select',
            label = 'Priority',
            options = {
                {value = 'low', text = 'Low'},
                {value = 'medium', text = 'Medium'},
                {value = 'high', text = 'High'}
            },
            default = 'medium'
        },
        {
            type = 'textarea',
            label = 'Description',
            placeholder = 'Detailed description of the issue...',
            required = true,
            default = initialText or ''
        }
    ]
    
    -- This would typically use your server's input system
    -- For this example, we'll trigger a client event to handle the form
    TriggerEvent('ahrp:openReportForm', input)
end

-- Full report menu (NUI-based)
function OpenReportMenu()
    if not Config.ReportSystem.enableInGameReports then
        ShowNotification('In-game reporting is disabled. Please use the web interface.', 'error')
        return
    end
    
    if isReportMenuOpen then
        return
    end
    
    isReportMenuOpen = true
    SetNuiFocus(true, true)
    
    -- Send data to NUI
    SendNUIMessage({
        type = 'openReportMenu',
        data = {
            categories = Config.ReportSystem.categories,
            playerData = playerData,
            config = {
                enableAnonymous = Config.ReportSystem.enableAnonymousReports,
                defaultPriority = Config.ReportSystem.defaultPriority
            }
        }
    })
end

-- Close report menu
function CloseReportMenu()
    if not isReportMenuOpen then
        return
    end
    
    isReportMenuOpen = false
    SetNuiFocus(false, false)
    
    SendNUIMessage({
        type = 'closeReportMenu'
    })
end

-- NUI Callbacks
RegisterNUICallback('closeMenu', function(data, cb)
    CloseReportMenu()
    cb('ok')
end)

RegisterNUICallback('submitReport', function(data, cb)
    SubmitReport(data)
    cb('ok')
end)

-- Submit report function
function SubmitReport(reportData)
    -- Validate required fields
    if not reportData.type or not reportData.category or not reportData.description then
        ShowNotification('Please fill in all required fields.', 'error')
        return
    end
    
    if string.len(reportData.description) < 10 then
        ShowNotification('Description must be at least 10 characters long.', 'error')
        return
    end
    
    -- Add player context data
    local submitData = {
        type = reportData.type,
        category = reportData.category,
        subcategory = reportData.subcategory,
        priority = reportData.priority or Config.ReportSystem.defaultPriority,
        description = reportData.description,
        target_player_id = reportData.targetPlayerId,
        anonymous = reportData.anonymous or false,
        reporter_player_id = playerData.serverId,
        metadata = {
            location = playerData.coords,
            vehicle = playerData.vehicle,
            timestamp = os.date('%Y-%m-%d %H:%M:%S'),
            server_time = GetCloudTimeAsInt()
        }
    }
    
    -- Send to server
    TriggerServerEvent('ahrp:submitReport', submitData)
    
    -- Update cooldown
    lastReportTime = GetGameTimer()
    
    -- Close menu
    CloseReportMenu()
    
    -- Show confirmation
    ShowNotification('Report submitted successfully! You will be notified of any updates.', 'success')
end

-- Handle key press for opening menu
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        
        if IsControlJustReleased(0, 168) then -- F7 key
            if Config.UI.openKey == "F7" then
                OpenReportMenu()
            end
        end
    end
end)

-- Event handlers
RegisterNetEvent('ahrp:openReportForm')
AddEventHandler('ahrp:openReportForm', function(formData)
    -- Handle form opening (could integrate with your server's input system)
    print('Report form data:', json.encode(formData))
end)

RegisterNetEvent('ahrp:reportSubmitted')
AddEventHandler('ahrp:reportSubmitted', function(success, message, reportId)
    if success then
        ShowNotification('Report #' .. reportId .. ' submitted successfully!', 'success')
    else
        ShowNotification('Failed to submit report: ' .. message, 'error')
    end
end)

RegisterNetEvent('ahrp:reportUpdate')
AddEventHandler('ahrp:reportUpdate', function(reportId, status, message)
    ShowNotification('Report #' .. reportId .. ' status: ' .. status .. (message and ' - ' .. message or ''), 'info')
end)

-- Utility functions
function ShowNotification(message, type)
    type = type or 'info'
    
    if Config.Notifications.type == 'mythic' then
        -- Mythic notify integration
        exports['mythic_notify']:SendAlert(type, message, Config.Notifications.duration)
    elseif Config.Notifications.type == 'pnotify' then
        -- pNotify integration
        exports['pnotify']:SendNotification({
            text = message,
            type = type,
            timeout = Config.Notifications.duration,
            layout = 'topRight'
        })
    elseif Config.Notifications.type == 'okoknotify' then
        -- okokNotify integration
        exports['okokNotify']:Alert('AHRP Reports', message, Config.Notifications.duration, type)
    else
        -- Default FiveM notification
        SetNotificationTextEntry('STRING')
        AddTextComponentString(message)
        DrawNotification(0, 1)
    end
end

-- Staff notification system
RegisterNetEvent('ahrp:staffNotification')
AddEventHandler('ahrp:staffNotification', function(data)
    -- Only show to staff members
    if IsPlayerStaff() then
        local message = string.format('[REPORT] New %s report #%d - Priority: %s', 
            data.type:gsub('_', ' '):upper(), 
            data.reportId, 
            data.priority:upper()
        )
        ShowNotification(message, 'warning')
    end
end)

-- Check if player is staff (framework-agnostic)
function IsPlayerStaff()
    local playerId = PlayerId()
    
    -- ACE Permissions (default method)
    if Config.Permissions.method == "ace" then
        for _, group in pairs(Config.Permissions.staffGroups) do
            if IsPlayerAceAllowed(tostring(GetPlayerServerId(playerId)), 'group.' .. group) then
                return true
            end
        end
    end
    
    -- Discord role-based permissions
    if Config.Permissions.method == "discord" then
        local discordId = GetDiscordId()
        if discordId then
            -- This would require a server callback to check Discord roles
            -- For now, we'll use a server event to check
            TriggerServerEvent('ahrp:checkStaffPermission', 'discord', discordId)
            return false -- Will be updated via callback
        end
    end
    
    -- Steam/License identifier based permissions
    if Config.Permissions.method == "steam" or Config.Permissions.method == "license" then
        local identifiers = GetPlayerIdentifiers(PlayerId())
        for _, id in pairs(identifiers) do
            if string.match(id, Config.Permissions.method .. ':') then
                for _, staffId in pairs(Config.Permissions.staffIdentifiers) do
                    if id == staffId then
                        return true
                    end
                end
            end
        end
    end
    
    -- Framework-specific checks
    if Config.Framework.type == "esx" then
        local ESX = exports[Config.Framework.esxSharedObject]:getSharedObject()
        if ESX then
            local playerData = ESX.GetPlayerData()
            if playerData.job and playerData.job.name then
                for _, group in pairs(Config.Permissions.staffGroups) do
                    if playerData.job.name == group then
                        return true
                    end
                end
            end
        end
    elseif Config.Framework.type == "qbcore" then
        local QBCore = exports[Config.Framework.qbcoreExport]:GetCoreObject()
        if QBCore then
            local PlayerData = QBCore.Functions.GetPlayerData()
            if PlayerData.job and (PlayerData.job.type == 'leo' or PlayerData.job.name == 'admin' or PlayerData.job.name == 'moderator') then
                return true
            end
        end
    end
    
    return false
end

-- Helper function to get Discord ID
function GetDiscordId()
    local identifiers = GetPlayerIdentifiers(PlayerId())
    for _, id in pairs(identifiers) do
        if string.match(id, 'discord:') then
            return string.gsub(id, 'discord:', '')
        end
    end
    return nil
end

-- Additional event handlers for staff permission callbacks
RegisterNetEvent('ahrp:staffPermissionResult')
AddEventHandler('ahrp:staffPermissionResult', function(hasPermission)
    -- This could be used to update UI elements based on staff status
    if hasPermission then
        -- Player has staff permissions
        playerData.isStaff = true
    else
        playerData.isStaff = false
    end
end)

-- Export functions for other resources
exports('openReportMenu', OpenReportMenu)
exports('submitReport', SubmitReport)
exports('isReportMenuOpen', function() return isReportMenuOpen end)
exports('isPlayerStaff', IsPlayerStaff)
exports('getPlayerData', function() return playerData end)