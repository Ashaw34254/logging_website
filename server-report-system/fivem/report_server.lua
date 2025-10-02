-- AHRP Report System - Server Side
local reportCooldowns = {}
local ESX = nil

-- Initialize ESX if enabled
Citizen.CreateThread(function()
    if Config.ESX.enabled then
        while ESX == nil do
            TriggerEvent(Config.ESX.getSharedObject, function(obj) ESX = obj end)
            Citizen.Wait(0)
        end
    end
end)

-- Handle report submission from client
RegisterServerEvent('ahrp:submitReport')
AddEventHandler('ahrp:submitReport', function(reportData)
    local source = source
    local playerName = GetPlayerName(source)
    local playerIdentifiers = GetPlayerIdentifiers(source)
    
    -- Get Discord ID if available
    local discordId = nil
    for _, id in pairs(playerIdentifiers) do
        if string.match(id, 'discord:') then
            discordId = string.gsub(id, 'discord:', '')
            break
        end
    end
    
    -- Check cooldown
    local currentTime = os.time()
    if reportCooldowns[source] and (currentTime - reportCooldowns[source]) < Config.ReportSystem.cooldownTime then
        TriggerClientEvent('ahrp:reportSubmitted', source, false, 'Please wait before submitting another report.', nil)
        return
    end
    
    -- Validate data
    if not reportData.type or not reportData.category or not reportData.description then
        TriggerClientEvent('ahrp:reportSubmitted', source, false, 'Missing required fields.', nil)
        return
    end
    
    if string.len(reportData.description) < 10 then
        TriggerClientEvent('ahrp:reportSubmitted', source, false, 'Description too short.', nil)
        return
    end
    
    -- Prepare data for API
    local apiData = {
        type = reportData.type,
        category = reportData.category,
        subcategory = reportData.subcategory,
        priority = reportData.priority or Config.ReportSystem.defaultPriority,
        description = reportData.description,
        target_player_id = reportData.target_player_id,
        anonymous = reportData.anonymous or false,
        reporter_player_id = source,
        reporter_discord_id = (not reportData.anonymous) and discordId or nil,
        metadata = json.encode(reportData.metadata or {})
    }
    
    -- Submit to API
    PerformHttpRequest(Config.ReportSystem.apiUrl .. '/reports/submit/fivem', function(errorCode, resultData, resultHeaders)
        if errorCode == 201 then
            -- Success
            local response = json.decode(resultData)
            local reportId = response.report and response.report.id or 'Unknown'
            
            -- Update cooldown
            reportCooldowns[source] = currentTime
            
            -- Notify client
            TriggerClientEvent('ahrp:reportSubmitted', source, true, 'Report submitted successfully!', reportId)
            
            -- Notify staff
            NotifyStaff({
                type = reportData.type,
                reportId = reportId,
                priority = reportData.priority,
                reporter = not reportData.anonymous and playerName or 'Anonymous',
                description = reportData.description
            })
            
            -- Log to console
            print(string.format('[AHRP Reports] New %s report #%s from %s (%s)', 
                reportData.type, 
                reportId, 
                playerName, 
                source
            ))
            
        else
            -- Error
            print('Report submission failed:', errorCode, resultData)
            TriggerClientEvent('ahrp:reportSubmitted', source, false, 'Failed to submit report. Please try again.', nil)
        end
    end, 'POST', json.encode(apiData), {
        ['Content-Type'] = 'application/json',
        ['x-api-key'] = Config.ReportSystem.apiKey
    })
end)

-- Notify staff members
function NotifyStaff(reportData)
    local players = GetPlayers()
    
    for _, playerId in pairs(players) do
        local playerIdInt = tonumber(playerId)
        if playerIdInt and IsPlayerStaff(playerIdInt) then
            TriggerClientEvent('ahrp:staffNotification', playerIdInt, reportData)
        end
    end
end

-- Check if player is staff
function IsPlayerStaff(playerId)
    -- ESX Integration
    if Config.ESX.enabled and ESX then
        local xPlayer = ESX.GetPlayerFromId(playerId)
        if xPlayer then
            local group = xPlayer.getGroup()
            for _, staffGroup in pairs(Config.Permissions.staffGroups) do
                if group == staffGroup then
                    return true
                end
            end
        end
    end
    
    -- ACE Permissions
    for _, group in pairs(Config.Permissions.staffGroups) do
        if IsPlayerAceAllowed(playerId, 'group.' .. group) then
            return true
        end
    end
    
    -- QBCore Integration (uncomment if using QBCore)
    -- local QBCore = exports['qb-core']:GetCoreObject()
    -- local Player = QBCore.Functions.GetPlayer(playerId)
    -- if Player then
    --     local job = Player.PlayerData.job
    --     if job and (job.type == 'leo' or job.name == 'admin' or job.name == 'moderator') then
    --         return true
    --     end
    -- end
    
    return false
end

-- Staff commands
RegisterCommand('reports', function(source, args, rawCommand)
    if source == 0 then return end -- Console command
    
    if not IsPlayerStaff(source) then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            multiline = true,
            args = {"System", "You don't have permission to use this command."}
        })
        return
    end
    
    -- Get recent reports from API
    PerformHttpRequest(Config.ReportSystem.apiUrl .. '/reports?limit=10', function(errorCode, resultData, resultHeaders)
        if errorCode == 200 then
            local response = json.decode(resultData)
            local reports = response.reports or {}
            
            TriggerClientEvent('chat:addMessage', source, {
                color = {0, 255, 0},
                multiline = true,
                args = {"Reports", "Recent reports:"}
            })
            
            for _, report in pairs(reports) do
                local message = string.format("#%d - %s - %s - %s", 
                    report.id,
                    report.type:gsub('_', ' '):upper(),
                    report.priority:upper(),
                    report.status:upper()
                )
                
                TriggerClientEvent('chat:addMessage', source, {
                    color = {200, 200, 200},
                    multiline = true,
                    args = {"", message}
                })
            end
        else
            TriggerClientEvent('chat:addMessage', source, {
                color = {255, 0, 0},
                multiline = true,
                args = {"System", "Failed to fetch reports."}
            })
        end
    end, 'GET', '', {
        ['x-api-key'] = Config.ReportSystem.apiKey
    })
end, false)

-- Report admin commands
RegisterCommand('reportadmin', function(source, args, rawCommand)
    if source == 0 then return end
    
    if not IsPlayerStaff(source) or not HasPermission(source, Config.Permissions.commands.reportadmin) then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            multiline = true,
            args = {"System", "You don't have permission to use this command."}
        })
        return
    end
    
    if not args[1] then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 255, 0},
            multiline = true,
            args = {"Usage", "/reportadmin [status/assign] [reportId] [value]"}
        })
        return
    end
    
    local action = args[1]:lower()
    local reportId = tonumber(args[2])
    local value = args[3]
    
    if not reportId then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            multiline = true,
            args = {"Error", "Invalid report ID."}
        })
        return
    end
    
    if action == 'status' and value then
        -- Update report status
        local validStatuses = {'pending', 'in_progress', 'resolved', 'rejected'}
        local isValid = false
        
        for _, status in pairs(validStatuses) do
            if status == value:lower() then
                isValid = true
                break
            end
        end
        
        if not isValid then
            TriggerClientEvent('chat:addMessage', source, {
                color = {255, 0, 0},
                multiline = true,
                args = {"Error", "Invalid status. Use: pending, in_progress, resolved, rejected"}
            })
            return
        end
        
        -- API call to update status
        local updateData = {
            status = value:lower(),
            notes = 'Updated from in-game by ' .. GetPlayerName(source)
        }
        
        PerformHttpRequest(Config.ReportSystem.apiUrl .. '/reports/' .. reportId .. '/status', function(errorCode, resultData, resultHeaders)
            if errorCode == 200 then
                TriggerClientEvent('chat:addMessage', source, {
                    color = {0, 255, 0},
                    multiline = true,
                    args = {"Success", "Report #" .. reportId .. " status updated to " .. value}
                })
            else
                TriggerClientEvent('chat:addMessage', source, {
                    color = {255, 0, 0},
                    multiline = true,
                    args = {"Error", "Failed to update report status."}
                })
            end
        end, 'PATCH', json.encode(updateData), {
            ['Content-Type'] = 'application/json',
            ['x-api-key'] = Config.ReportSystem.apiKey
        })
        
    elseif action == 'assign' then
        -- Assign report to staff member
        -- This would require additional implementation
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 255, 0},
            multiline = true,
            args = {"Info", "Report assignment feature coming soon. Use the web interface."}
        })
    else
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 255, 0},
            multiline = true,
            args = {"Usage", "/reportadmin [status/assign] [reportId] [value]"}
        })
    end
end, false)

-- Check permissions
function HasPermission(playerId, permission)
    if permission == 'user' then
        return true
    end
    
    return IsPlayerStaff(playerId)
end

-- Discord webhook notifications
function SendDiscordWebhook(reportData)
    local webhook = nil
    
    if reportData.type == 'player_report' then
        webhook = Config.Webhooks.urls.player_reports
    elseif reportData.type == 'bug_report' then
        webhook = Config.Webhooks.urls.bug_reports
    else
        webhook = Config.Webhooks.urls.feedback
    end
    
    if not webhook or webhook == "" then
        return
    end
    
    local embed = {
        {
            color = reportData.priority == 'high' and 16711680 or reportData.priority == 'medium' and 16776960 or 65280,
            title = "New " .. reportData.type:gsub('_', ' '):upper() .. " Report",
            description = reportData.description,
            fields = {
                {
                    name = "Report ID",
                    value = "#" .. (reportData.reportId or 'Unknown'),
                    inline = true
                },
                {
                    name = "Priority",
                    value = reportData.priority:upper(),
                    inline = true
                },
                {
                    name = "Category",
                    value = reportData.category,
                    inline = true
                },
                {
                    name = "Reporter",
                    value = reportData.reporter or 'Anonymous',
                    inline = true
                }
            },
            timestamp = os.date('!%Y-%m-%dT%H:%M:%SZ')
        }
    }
    
    PerformHttpRequest(webhook, function(err, text, headers) end, 'POST', json.encode({
        username = Config.Webhooks.botName,
        avatar_url = Config.Webhooks.avatar,
        embeds = embed
    }), { ['Content-Type'] = 'application/json' })
end

-- API health check
Citizen.CreateThread(function()
    Citizen.Wait(10000) -- Wait 10 seconds after resource start
    
    PerformHttpRequest(Config.ReportSystem.apiUrl .. '/health', function(errorCode, resultData, resultHeaders)
        if errorCode == 200 then
            print('[AHRP Reports] Successfully connected to API server')
        else
            print('[AHRP Reports] WARNING: Cannot connect to API server. Error code: ' .. errorCode)
            print('[AHRP Reports] Please check your API configuration in config.lua')
        end
    end, 'GET')
end)

-- Clean up cooldowns periodically
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(300000) -- 5 minutes
        
        local currentTime = os.time()
        for playerId, lastTime in pairs(reportCooldowns) do
            if (currentTime - lastTime) > Config.ReportSystem.cooldownTime then
                reportCooldowns[playerId] = nil
            end
        end
    end
end)

-- Player disconnect cleanup
AddEventHandler('playerDropped', function(reason)
    local source = source
    reportCooldowns[source] = nil
end)

-- Export functions
exports('isPlayerStaff', IsPlayerStaff)
exports('submitReportFromScript', function(playerId, reportData)
    -- Allow other resources to submit reports
    TriggerEvent('ahrp:submitReport', reportData)
end)