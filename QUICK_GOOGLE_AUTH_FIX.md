# Quick Google Auth Fix Guide

## 🚨 Follow These Exact Steps to Fix Google Sign-In

### Step 1: Firebase Console - Enable Google Auth
1. Go to **[Firebase Console](https://console.firebase.google.com/project/swachhsaarthi)**
2. Click **"Authentication"** in left sidebar
3. Click **"Sign-in method"** tab
4. Find **"Google"** in the list and click it
5. Toggle **"Enable"** to ON
6. In **"Web SDK configuration"**:
   - Public-facing name: `Swachh Saarthi`
   - Support email: `[Your Gmail Address]`
7. Click **"Save"**

### Step 2: Add Authorized Domains
1. Still in **Authentication > Sign-in method**
2. Scroll down to **"Authorized domains"**
3. Click **"Add domain"**
4. Add these domains one by one:
   ```
   localhost
   ```
   ```
   127.0.0.1
   ```
5. Click **"Done"** for each

### Step 3: Google Cloud Console Setup
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Select project **"swachhsaarthi"** from dropdown
3. Go to **"APIs & Services" > "Credentials"**
4. Find your **OAuth 2.0 Client ID** (should be auto-created by Firebase)
5. Click on it to edit

### Step 4: Configure OAuth Client
In the OAuth client settings, add these **Authorized JavaScript origins**:
```
http://localhost:8080
http://localhost:5173
http://localhost:3000
https://swachhsaarthi.firebaseapp.com
```

Add these **Authorized redirect URIs**:
```
http://localhost:8080/__/auth/handler
http://localhost:5173/__/auth/handler
http://localhost:3000/__/auth/handler
https://swachhsaarthi.firebaseapp.com/__/auth/handler
```

### Step 5: Test with Debug Panel
1. Go to your app: `http://localhost:8080`
2. Scroll down to **"Google Auth Debug Panel"**
3. Click **"Test Google Sign-In"**
4. Check the results:
   - ✅ **SUCCESS**: You're all set!
   - ❌ **FAILED**: See error message and follow solution

### Step 6: Common Error Fixes

#### Error: "This app isn't verified"
**Solution:**
- Click **"Advanced"**
- Click **"Go to Swachh Saarthi (unsafe)"**
- This is normal for development

#### Error: "redirect_uri_mismatch"
**Solution:**
- Copy the exact redirect URI from error message
- Add it to **Authorized redirect URIs** in Google Cloud Console

#### Error: "popup_blocked_by_browser"
**Solution:**
- Look for popup blocked icon in address bar
- Click it and allow popups for this site

#### Error: "auth/operation-not-allowed"
**Solution:**
- Make sure Google sign-in is enabled in Firebase Console
- Wait 5-10 minutes after enabling for changes to propagate

### Step 7: OAuth Consent Screen (If Required)
If you get consent screen errors:

1. Go to **Google Cloud Console > APIs & Services > OAuth consent screen**
2. Choose **"External"** user type
3. Fill out required fields:
   ```
   App name: Swachh Saarthi
   User support email: [Your Email]
   Developer contact: [Your Email]
   ```
4. Add these scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (your Gmail accounts)
6. Save and continue

### Step 8: Verify Everything Works
1. Test the debug panel again
2. Try signing in through the navbar dropdown
3. Check browser console for any remaining errors

## 🎯 Quick Checklist
- [ ] Google sign-in enabled in Firebase
- [ ] Localhost domains added to Firebase authorized domains
- [ ] OAuth client configured with correct URLs
- [ ] Popup blocker disabled for your site
- [ ] Browser console shows no errors

## 🆘 Still Having Issues?
If you're still getting errors:

1. **Check Browser Console** (F12 → Console tab)
2. **Test in Incognito Mode** (eliminates cache issues)
3. **Wait 10 minutes** after making changes (propagation time)
4. **Try different browser** (Chrome works best with Google Auth)

## 📞 Debug Information
When testing, the debug panel will show:
- Your current configuration
- Exact error codes and messages
- Specific solutions for each error type
- Success confirmation with user details

Follow these steps exactly and your Google authentication should work perfectly! 🎉

