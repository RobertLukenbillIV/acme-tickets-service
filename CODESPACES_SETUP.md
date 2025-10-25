# 🚀 Codespaces Setup Guide

## The Problem You're Experiencing

When you access the demo site in Opera, it's trying to connect to the API but getting "Failed to fetch" because:
1. The demo runs on port **8080** (the frontend)
2. The API runs on port **3000** (the backend)
3. Both ports need to be **publicly accessible** in Codespaces

## ✅ Solution: Make Ports Public

### Step 1: Open the PORTS Tab in VS Code

1. Look at the **bottom panel** in VS Code
2. Click the **"PORTS"** tab (it's next to "TERMINAL", "PROBLEMS", etc.)
3. You should see ports 3000 and 8080 listed

### Step 2: Make Both Ports Public

For **port 3000** (API):
1. Find "3000" in the ports list
2. Right-click on it
3. Select **"Port Visibility" → "Public"**

For **port 8080** (Demo Site):
1. Find "8080" in the ports list
2. Right-click on it
3. Select **"Port Visibility" → "Public"**

### Step 3: Access the Demo

After making both ports public, access the demo at:

```
https://shiny-invention-j4x6ggrqxrgcpp9j-8080.app.github.dev
```

The demo will **automatically detect** and use the correct API URL:

```
https://shiny-invention-j4x6ggrqxrgcpp9j-3000.app.github.dev/api/v1
```

## 🔍 How to Verify It's Working

1. **Refresh the demo page** in Opera (Ctrl+F5 or Cmd+Shift+R)
2. Look at the **login box** - it should show the API URL at the bottom
3. Check your browser's **Developer Console** (F12) - it should log: `API Base URL: https://...`
4. Try logging in with the demo credentials

## 🛠️ Alternative: Use Command Line

You can also set port visibility from the terminal:

```bash
# Make port 3000 public
gh codespace ports visibility 3000:public -c $CODESPACE_NAME

# Make port 8080 public  
gh codespace ports visibility 8080:public -c $CODESPACE_NAME
```

## 🎯 What I Fixed

I updated the demo frontend (`demo-site/app.js`) to:

1. **Auto-detect** if it's running in Codespaces
2. **Automatically use** the correct forwarded port URL
3. **Show the API URL** on the login screen
4. **Provide better error messages** if the API is unreachable

## 📝 Expected URLs

| Service | Port | Local URL | Codespaces URL |
|---------|------|-----------|----------------|
| Demo Site | 8080 | http://localhost:8080 | https://shiny-invention-j4x6ggrqxrgcpp9j-8080.app.github.dev |
| API | 3000 | http://localhost:3000 | https://shiny-invention-j4x6ggrqxrgcpp9j-3000.app.github.dev |
| API Docs | 3000 | http://localhost:3000/api-docs | https://shiny-invention-j4x6ggrqxrgcpp9j-3000.app.github.dev/api-docs |

## 🚨 If It Still Doesn't Work

1. **Check the browser console** (F12 → Console tab) for error messages
2. **Verify both ports are public** in the PORTS tab
3. **Test the API directly**: Try opening `https://your-codespace-3000.app.github.dev/health` in Opera
4. **Restart the demo server**:
   ```bash
   # Kill the old server
   pkill -f "python3 -m http.server 8080"
   
   # Start a new one
   cd /workspaces/acme-tickets-service/demo-site
   python3 -m http.server 8080
   ```

## ✅ Quick Test

Test if the API is accessible:

```bash
# This should return {"status": "ok", ...}
curl https://shiny-invention-j4x6ggrqxrgcpp9j-3000.app.github.dev/health
```

---

**After making ports public, hard refresh the page in Opera (Ctrl+F5) and try logging in again!** 🎉
