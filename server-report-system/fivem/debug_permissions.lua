-- AHRP Report System - Permission Debug Script
-- This script helps debug why permissions aren't working

-- Debug function to test permissions
function DebugPermissions(playerId)
    local playerIdStr = tostring(playerId)
    local playerName = GetPlayerName(playerId)
    local identifiers = GetPlayerIdentifiers(playerId)
    
    print("^3[AHRP DEBUG] Checking permissions for player: " .. playerName .. " (ID: " .. playerId .. ")^7")
    
    -- Show all identifiers
    print("^3[AHRP DEBUG] Player identifiers:^7")
    for i, id in pairs(identifiers) do
        print("  " .. i .. ": " .. id)
    end
    
    -- Test ACE permissions
    print("^3[AHRP DEBUG] Testing ACE permissions:^7")
    for _, group in pairs(Config.Permissions.staffGroups) do
        local hasPermission = IsPlayerAceAllowed(playerIdStr, 'group.' .. group)
        print("  group." .. group .. ": " .. (hasPermission and "^2✓ ALLOWED^7" or "^1✗ DENIED^7"))
    end
    
    -- Test direct ACE permission
    local hasDirectPermission = IsPlayerAceAllowed(playerIdStr, 'ahrp.reports')
    print("  ahrp.reports: " .. (hasDirectPermission and "^2✓ ALLOWED^7" or "^1✗ DENIED^7"))
    
    -- Test the actual IsPlayerStaff function
    local isStaff = IsPlayerStaff(playerId)
    print("^3[AHRP DEBUG] IsPlayerStaff result: " .. (isStaff and "^2✓ TRUE^7" or "^1✗ FALSE^7"))
    
    return isStaff
end

-- Command to debug permissions for yourself
RegisterCommand('debugperms', function(source, args, rawCommand)
    if source == 0 then 
        print("^1[AHRP DEBUG] This command can only be used by players^7")
        return 
    end
    
    DebugPermissions(source)
end, false)

-- Command to debug permissions for another player (admin only)
RegisterCommand('debugperms2', function(source, args, rawCommand)
    if source == 0 then 
        print("^1[AHRP DEBUG] This command can only be used by players^7")
        return 
    end
    
    if not args[1] then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            multiline = true,
            args = {"Debug", "Usage: /debugperms2 [playerId]"}
        })
        return
    end
    
    local targetId = tonumber(args[1])
    if not targetId or not GetPlayerName(targetId) then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            multiline = true,
            args = {"Debug", "Invalid player ID"}
        })
        return
    end
    
    DebugPermissions(targetId)
    TriggerClientEvent('chat:addMessage', source, {
        color = {0, 255, 0},
        multiline = true,
        args = {"Debug", "Check server console for permission debug info"}
    })
end, false)

-- Simple test command for ACE permissions
RegisterCommand('testace2', function(source, args, rawCommand)
    if source == 0 then return end
    
    local playerIdStr = tostring(source)
    local hasAcePermission = IsPlayerAceAllowed(playerIdStr, 'ahrp.reports')
    local hasGroupAdmin = IsPlayerAceAllowed(playerIdStr, 'group.admin')
    local hasGroupModerator = IsPlayerAceAllowed(playerIdStr, 'group.moderator')
    local hasGroupSupport = IsPlayerAceAllowed(playerIdStr, 'group.support')
    
    TriggerClientEvent('chat:addMessage', source, {
        color = {255, 255, 0},
        multiline = true,
        args = {"ACE Test Results:", ""}
    })
    
    TriggerClientEvent('chat:addMessage', source, {
        color = hasAcePermission and {0, 255, 0} or {255, 0, 0},
        multiline = true,
        args = {"ahrp.reports:", hasAcePermission and "✓ ALLOWED" or "✗ DENIED"}
    })
    
    TriggerClientEvent('chat:addMessage', source, {
        color = hasGroupAdmin and {0, 255, 0} or {255, 0, 0},
        multiline = true,
        args = {"group.admin:", hasGroupAdmin and "✓ ALLOWED" or "✗ DENIED"}
    })
    
    TriggerClientEvent('chat:addMessage', source, {
        color = hasGroupModerator and {0, 255, 0} or {255, 0, 0},
        multiline = true,
        args = {"group.moderator:", hasGroupModerator and "✓ ALLOWED" or "✗ DENIED"}
    })
    
    TriggerClientEvent('chat:addMessage', source, {
        color = hasGroupSupport and {0, 255, 0} or {255, 0, 0},
        multiline = true,
        args = {"group.support:", hasGroupSupport and "✓ ALLOWED" or "✗ DENIED"}
    })
end, false)

-- Auto-run debug on resource start
Citizen.CreateThread(function()
    Citizen.Wait(5000) -- Wait 5 seconds after start
    
    print("^2[AHRP DEBUG] Permission Debug System Loaded^7")
    print("^3[AHRP DEBUG] Available commands:^7")
    print("  ^5/debugperms^7 - Debug your own permissions")
    print("  ^5/debugperms2 [playerId]^7 - Debug another player's permissions")
    print("  ^5/testace2^7 - Test ACE permissions (in-game)")
    print("^3[AHRP DEBUG] Config Info:^7")
    print("  Framework: ^5" .. (Config.Framework and Config.Framework.type or "Unknown") .. "^7")
    print("  Permission Method: ^5" .. (Config.Permissions and Config.Permissions.method or "Unknown") .. "^7")
    print("  Staff Groups: ^5" .. table.concat(Config.Permissions.staffGroups, ", ") .. "^7")
end)