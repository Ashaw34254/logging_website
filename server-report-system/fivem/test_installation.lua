-- AHRP Report System - Installation Test Script
-- Run this script to verify your installation is working correctly

print("^2=== AHRP Report System Installation Test ===^7")

-- Test 1: Check if config exists and is valid
print("^3[TEST 1]^7 Checking configuration...")

if Config then
    print("^2✓^7 Config loaded successfully")
    
    if Config.ReportSystem and Config.ReportSystem.apiUrl then
        print("^2✓^7 API URL configured: " .. Config.ReportSystem.apiUrl)
    else
        print("^1✗^7 API URL not configured")
    end
    
    if Config.Framework and Config.Framework.type then
        print("^2✓^7 Framework type: " .. Config.Framework.type)
    else
        print("^1✗^7 Framework type not configured")
    end
    
    if Config.Permissions and Config.Permissions.method then
        print("^2✓^7 Permission method: " .. Config.Permissions.method)
    else
        print("^1✗^7 Permission method not configured")
    end
else
    print("^1✗^7 Config not loaded - check config.lua file")
    return
end

-- Test 2: Check API connectivity (server-side only)
if IsDuplicityVersion() then
    print("^3[TEST 2]^7 Testing API connectivity...")
    
    Citizen.CreateThread(function()
        Citizen.Wait(5000) -- Wait 5 seconds
        
        PerformHttpRequest(Config.ReportSystem.apiUrl .. '/health', function(errorCode, resultData, resultHeaders)
            if errorCode == 200 then
                print("^2✓^7 API server is reachable")
                
                -- Test authentication
                PerformHttpRequest(Config.ReportSystem.apiUrl .. '/auth/test', function(authCode, authData, authHeaders)
                    if authCode == 200 then
                        print("^2✓^7 API authentication working")
                    elseif authCode == 401 then
                        print("^1✗^7 API authentication failed - check your API key")
                    else
                        print("^3⚠^7 API authentication test returned code: " .. authCode)
                    end
                end, 'GET', '', {
                    ['x-api-key'] = Config.ReportSystem.apiKey
                })
            else
                print("^1✗^7 Cannot reach API server (Error: " .. errorCode .. ")")
                print("^1  ^7 Make sure your backend server is running")
                print("^1  ^7 Check API URL in config.lua: " .. Config.ReportSystem.apiUrl)
            end
        end, 'GET')
    end)
else
    print("^3[TEST 2]^7 Client-side test - skipping API connectivity test")
end

-- Test 3: Check framework integration
print("^3[TEST 3]^7 Checking framework integration...")

if Config.Framework.type == "standalone" then
    print("^2✓^7 Running in standalone mode")
elseif Config.Framework.type == "esx" then
    if GetResourceState("es_extended") == "started" then
        print("^2✓^7 ESX framework detected and running")
    else
        print("^1✗^7 ESX framework not found - check if es_extended resource is started")
    end
elseif Config.Framework.type == "qbcore" then
    if GetResourceState("qb-core") == "started" then
        print("^2✓^7 QBCore framework detected and running")
    else
        print("^1✗^7 QBCore framework not found - check if qb-core resource is started")
    end
else
    print("^3⚠^7 Unknown framework type: " .. Config.Framework.type)
end

-- Test 4: Check permissions system
print("^3[TEST 4]^7 Checking permissions system...")

if Config.Permissions.method == "ace" then
    print("^2✓^7 Using ACE permissions")
    print("^7  Make sure to add staff groups to server.cfg:")
    for _, group in pairs(Config.Permissions.staffGroups) do
        print("^7  add_ace group." .. group .. " ahrp.reports allow")
    end
elseif Config.Permissions.method == "discord" then
    print("^2✓^7 Using Discord role permissions")
    if #Config.Permissions.discordStaffRoles > 0 then
        print("^2✓^7 Discord staff roles configured: " .. #Config.Permissions.discordStaffRoles)
    else
        print("^1✗^7 No Discord staff roles configured")
    end
elseif Config.Permissions.method == "steam" or Config.Permissions.method == "license" then
    print("^2✓^7 Using identifier-based permissions (" .. Config.Permissions.method .. ")")
    if #Config.Permissions.staffIdentifiers > 0 then
        print("^2✓^7 Staff identifiers configured: " .. #Config.Permissions.staffIdentifiers)
    else
        print("^1✗^7 No staff identifiers configured")
    end
else
    print("^1✗^7 Unknown permission method: " .. Config.Permissions.method)
end

-- Test 5: Check notification system
print("^3[TEST 5]^7 Checking notification system...")

if Config.Notifications then
    local notifyType = Config.Notifications.type or "default"
    print("^2✓^7 Notification type: " .. notifyType)
    
    if notifyType ~= "default" then
        local resourceName = ""
        if notifyType == "mythic" then
            resourceName = "mythic_notify"
        elseif notifyType == "pnotify" then
            resourceName = "pnotify"
        elseif notifyType == "okoknotify" then
            resourceName = "okokNotify"
        end
        
        if resourceName ~= "" then
            if GetResourceState(resourceName) == "started" then
                print("^2✓^7 Notification resource '" .. resourceName .. "' is running")
            else
                print("^3⚠^7 Notification resource '" .. resourceName .. "' not found - falling back to default")
            end
        end
    end
else
    print("^3⚠^7 Notification config not found - using defaults")
end

print("^2=== Installation Test Complete ===^7")
print("^7If you see any ^1✗^7 errors above, please fix them before using the system.")
print("^7For support, check the README.md file or contact the development team.")

-- Export test function for manual testing
exports('runInstallationTest', function()
    print("^2Manual installation test triggered^7")
end)