# 🚀 AHRP Report System - Quick Start Scripts

## 📁 **Batch Files Created:**

### 🟢 **start-servers.bat**
- **Purpose:** Starts both backend and frontend servers
- **What it does:**
  - Kills any existing Node.js processes
  - Starts backend server on port 3001
  - Starts frontend server on port 3000
  - Opens connection test page
  - Each server runs in its own window

### 🔴 **stop-servers.bat**
- **Purpose:** Stops all running servers
- **What it does:**
  - Kills all Node.js processes
  - Checks if ports are freed
  - Shows status of each port

### 🔄 **restart-servers.bat**
- **Purpose:** Restarts both servers (stop + start)
- **What it does:**
  - Calls stop-servers.bat
  - Waits 3 seconds
  - Calls start-servers.bat

## 🎮 **How to Use:**

### **To Start Servers:**
1. **Double-click `start-servers.bat`**
2. **Wait for both windows to open**
3. **Check for "Compiled successfully!" in frontend window**
4. **Check for "🚀 AHRP Report System Backend running" in backend window**

### **To Stop Servers:**
1. **Double-click `stop-servers.bat`**
2. **All servers will be terminated**

### **To Restart Servers:**
1. **Double-click `restart-servers.bat`**
2. **Servers will stop and start automatically**

## 🖥️ **What You'll See:**

### **Backend Window:**
```
🚀 AHRP Report System Backend running on port 3001
📊 Environment: development
🔗 Frontend URL: http://localhost:3000
⏰ Automated tasks scheduled
❌ Database connection failed: (expected - no database installed)
⚠️  Discord bot not configured (missing token)
```

### **Frontend Window:**
```
Starting the development server...
Compiled successfully!
You can now view ahrp-report-frontend in the browser.
Local:            http://localhost:3000
```

## 🌐 **URLs After Starting:**

- **Backend API:** http://localhost:3001
- **Frontend UI:** http://localhost:3000
- **Health Check:** http://localhost:3001/api/health

## ⚡ **Quick Commands:**

### **In FiveM (after servers are running):**
```
/report          # Opens NUI interface
F7               # Opens NUI interface
/reportbug test  # Quick bug report
/testreport      # Test functionality
```

## 🛠️ **Troubleshooting:**

### **If Backend Fails:**
- Check if port 3001 is already in use
- Database errors are normal (no MySQL installed)
- Discord bot errors are normal (no token configured)

### **If Frontend Fails:**
- Check if port 3000 is already in use
- Wait longer for React to compile
- Look for compilation errors in the frontend window

### **If Both Fail:**
1. Run `stop-servers.bat`
2. Wait 5 seconds
3. Run `start-servers.bat` again

## 🎯 **Expected Behavior:**

✅ **Backend:** Starts with database/Discord warnings (normal)  
✅ **Frontend:** Compiles and serves React app  
✅ **FiveM:** Can submit reports via /report or F7  
✅ **Connection:** Frontend can communicate with backend  

---

## 🎉 **Ready to Test!**

1. **Run `start-servers.bat`**
2. **Wait for both servers to fully start**
3. **Open http://localhost:3000 in browser**
4. **Test `/report` command in FiveM**

**Both servers will run with expected warnings about database and Discord - this is normal for testing!**