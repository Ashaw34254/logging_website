-- AHRP Report System - Debug Test Script
-- This script helps test if the report command is working

print("^2[AHRP DEBUG] Report Debug Script Loaded^7")

-- Simple test command to verify commands are working
RegisterCommand('testreport', function(source, args, rawCommand)
    print("^2[AHRP DEBUG] Test report command executed by player " .. (source or "console") .. "^7")
    
    if source ~= 0 then
        TriggerClientEvent('chat:addMessage', source, {
            color = {0, 255, 0},
            multiline = true,
            args = {"AHRP Debug", "Test report command is working!"}
        })
    end
end, false)

-- Test if Config is loaded
Citizen.CreateThread(function()
    Citizen.Wait(2000)
    
    if Config then
        print("^2[AHRP DEBUG] Config is loaded^7")
        
        if Config.ReportSystem then
            print("^2[AHRP DEBUG] ReportSystem config exists^7")
            print("^3[AHRP DEBUG] API URL: " .. (Config.ReportSystem.apiUrl or "NOT SET") .. "^7")
            print("^3[AHRP DEBUG] In-game reports enabled: " .. tostring(Config.ReportSystem.enableInGameReports) .. "^7")
            print("^3[AHRP DEBUG] Cooldown time: " .. (Config.ReportSystem.cooldownTime or "NOT SET") .. " seconds^7")
        else
            print("^1[AHRP DEBUG] ReportSystem config missing!^7")
        end
    else
        print("^1[AHRP DEBUG] Config is NOT loaded!^7")
    end
end)

-- Test the report command directly
RegisterCommand('debugreportcmd', function(source, args, rawCommand)
    print("^3[AHRP DEBUG] Testing report command for player " .. source .. "^7")
    
    if source == 0 then
        print("^1[AHRP DEBUG] This command must be used by a player^7")
        return
    end
    
    -- Test if we can access the OpenReportMenu function
    if OpenReportMenu then
        print("^2[AHRP DEBUG] OpenReportMenu function exists^7")
        TriggerClientEvent('chat:addMessage', source, {
            color = {0, 255, 0},
            multiline = true,
            args = {"Debug", "OpenReportMenu function found - trying to call it..."}
        })
        
        -- Try to call the function
        local success, err = pcall(OpenReportMenu)
        if success then
            print("^2[AHRP DEBUG] OpenReportMenu called successfully^7")
        else
            print("^1[AHRP DEBUG] Error calling OpenReportMenu: " .. tostring(err) .. "^7")
            TriggerClientEvent('chat:addMessage', source, {
                color = {255, 0, 0},
                multiline = true,
                args = {"Debug Error", tostring(err)}
            })
        end
    else
        print("^1[AHRP DEBUG] OpenReportMenu function NOT found!^7")
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            multiline = true,
            args = {"Debug Error", "OpenReportMenu function not found!"}
        })
    end
end, false)

-- Check if the original report command is registered
RegisterCommand('checkreportcmd', function(source, args, rawCommand)
    if source == 0 then return end
    
    -- This will tell us if there are any command conflicts
    TriggerClientEvent('chat:addMessage', source, {
        color = {255, 255, 0},
        multiline = true,
        args = {"Debug", "If you see this, commands are working. Try /report now."}
    })
end, false)

print("^2[AHRP DEBUG] Available debug commands:^7")
print("^5  /testreport^7 - Test basic command functionality")
print("^5  /debugreportcmd^7 - Test report menu function")
print("^5  /checkreportcmd^7 - Check command system")
print("^3[AHRP DEBUG] Now try the original /report command^7")