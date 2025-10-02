# 🚨 PERMISSION TROUBLESHOOTING GUIDE 🚨

The "permission denied" issue is likely due to ACE permissions not being set up correctly. Follow these steps:

## STEP 1: Quick Fix - Give Everyone Permission (TESTING ONLY!)

Add this line to your **server.cfg** file:
```cfg
# TEMPORARY - Give everyone permission for testing
add_ace builtin.everyone ahrp.reports allow
```

⚠️ **WARNING**: This gives EVERYONE permission to use staff commands. Remove this after testing!

## STEP 2: Test the Fix

1. **Restart your FiveM server** (important!)
2. **Join your server**
3. **Use the debug command**: `/debugperms`
4. **Check server console** for permission results
5. **Try the report command**: `/report`

## STEP 3: Set Up Proper Permissions

After confirming it works, remove the "builtin.everyone" line and add proper permissions:

### 3A: Find Your Identifiers
Use the `/debugperms` command in-game, then check your server console. You'll see something like:
```
Player YourName (ID: 1)
Player identifiers:
  1: steam:110000100000000
  2: license:abc123def456789
  3: discord:123456789012345678
```

### 3B: Add Your Permissions to server.cfg
Replace the "builtin.everyone" line with:
```cfg
# Remove the everyone permission
# add_ace builtin.everyone ahrp.reports allow  # <- REMOVE THIS LINE

# Add proper staff permissions
add_ace group.admin ahrp.reports allow

# Add yourself to admin group (REPLACE WITH YOUR ACTUAL IDENTIFIERS)
add_principal identifier.steam:110000100000000 group.admin
# OR use license (more reliable):
add_principal identifier.license:abc123def456789 group.admin
```

## STEP 4: Verify Everything Works

1. **Restart server** after making changes
2. **Use `/testace2`** command in-game to test permissions
3. **Use `/debugperms`** to see detailed permission info
4. **Try `/report`** command

## COMMON ISSUES:

### Issue: "Permission denied" even with builtin.everyone
**Solution**: Make sure you restarted the FiveM server after adding the permission

### Issue: Debug commands not working
**Solution**: Make sure the resource is started properly:
```cfg
ensure ahrp-reports
```

### Issue: Still getting permission errors
**Solution**: Check server console for errors when the resource starts

## QUICK TEST COMMANDS:

Once in-game, use these commands to test:
- `/debugperms` - Shows your permission status
- `/testace2` - Tests ACE permissions in chat
- `/report` - Try to open report menu

## SERVER.CFG TEMPLATE FOR TESTING:

```cfg
# AHRP Reports Testing Configuration
ensure ahrp-reports

# TEMPORARY - Remove after testing!
add_ace builtin.everyone ahrp.reports allow

# When ready, replace above with proper permissions:
# add_ace group.admin ahrp.reports allow
# add_principal identifier.steam:YOUR_STEAM_ID group.admin
```

## NEED MORE HELP?

1. Check server console when starting the resource
2. Use `/debugperms` and share the console output
3. Make sure the backend server is running (check port 3001)
4. Verify the API key matches between FiveM config and backend .env

The key is: **ADD THE PERMISSION → RESTART SERVER → TEST IN-GAME**