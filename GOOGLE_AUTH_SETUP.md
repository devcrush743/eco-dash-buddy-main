# Google Authentication Setup Guide

This guide will walk you through setting up Google OAuth authentication for Swachh Saarthi citizens.

## 🔧 Step 1: Firebase Console Setup

### 1.1 Enable Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/project/swachhsaarthi)
2. Click **"Authentication"** in the left sidebar
3. Click **"Get started"** if it's your first time
4. Go to **"Sign-in method"** tab

### 1.2 Enable Google Sign-In
1. In the Sign-in providers list, click **"Google"**
2. Toggle the **"Enable"** switch
3. **Important**: Set the **"Public-facing name"** to **"Swachh Saarthi"**
4. Add your **support email** (use your Gmail account)
5. Click **"Save"**

## 🌐 Step 2: OAuth Consent Screen (Google Cloud Console)

### 2.1 Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project **"swachhsaarthi"**
3. Go to **APIs & Services > OAuth consent screen**

### 2.2 Configure OAuth Consent Screen
```
Application Name: Swachh Saarthi
User Support Email: [Your Email]
Developer Contact Email: [Your Email]
Application Domain: swachhsaarthi.firebaseapp.com
Authorized Domains: 
  - swachhsaarthi.firebaseapp.com
  - localhost (for development)
```

### 2.3 Scopes (Add these required scopes)
- `email`
- `profile`
- `openid`

### 2.4 Test Users (for development)
Add your Gmail accounts that you'll use for testing:
- Your primary Gmail account
- Any other test accounts

## 🔑 Step 3: OAuth 2.0 Client Configuration

### 3.1 Go to Credentials
1. In Google Cloud Console, go to **APIs & Services > Credentials**
2. You should see an OAuth 2.0 Client ID created by Firebase

### 3.2 Configure Authorized Domains
Click on the OAuth 2.0 Client ID and add these domains:

**Authorized JavaScript Origins:**
```
http://localhost:8080
http://localhost:3000
http://localhost:5173
https://swachhsaarthi.firebaseapp.com
https://swachhsaarthi.web.app
```

**Authorized Redirect URIs:**
```
http://localhost:8080/__/auth/handler
http://localhost:3000/__/auth/handler
http://localhost:5173/__/auth/handler
https://swachhsaarthi.firebaseapp.com/__/auth/handler
https://swachhsaarthi.web.app/__/auth/handler
```

## 🚀 Step 4: Test the Setup

### 4.1 Start Your Development Server
```bash
npm run dev
```

### 4.2 Test Google Sign-In
1. Open your app in browser
2. Click the **"Sign In"** button in navbar
3. Select **"Citizen Portal"**
4. Click **"Continue with Google"**
5. Choose your Google account
6. Grant permissions

## 🐛 Common Errors and Solutions

### Error 1: "OAuth client not found"
**Solution:**
- Check that your Firebase project is linked to Google Cloud
- Verify the OAuth client exists in Google Cloud Console

### Error 2: "This app isn't verified"
**Solution:**
```
This is normal for development. Click "Advanced" → "Go to Swachh Saarthi (unsafe)"
For production, you'll need to verify your app with Google.
```

### Error 3: "redirect_uri_mismatch"
**Solution:**
- Add your current domain to authorized redirect URIs
- For local development, add: `http://localhost:8080/__/auth/handler`

### Error 4: "Access blocked: This app's request is invalid"
**Solution:**
- Complete the OAuth consent screen configuration
- Add all required information (app name, support email, etc.)
- Add your domain to authorized domains

### Error 5: "popup_blocked_by_browser"
**Solution:**
- Allow popups for your domain
- Or disable popup blocker temporarily

## 🔒 Security Best Practices

### Development Environment
```javascript
// In firebase.ts - these domains are already configured
const firebaseConfig = {
  authDomain: "swachhsaarthi.firebaseapp.com",
  // ... other config
};
```

### Production Checklist
- [ ] Complete OAuth consent screen verification
- [ ] Add production domain to authorized origins
- [ ] Enable Google Cloud billing (if required)
- [ ] Set up proper error handling
- [ ] Configure rate limiting

## 📱 Testing Different Scenarios

### Test 1: New User Sign-Up
1. Use a Gmail account that hasn't signed up before
2. Should create new citizen profile automatically
3. Should redirect to citizen dashboard

### Test 2: Existing User Sign-In
1. Use a Gmail account that has signed up before
2. Should load existing profile
3. Should redirect to appropriate dashboard

### Test 3: Multiple Accounts
1. Test switching between different Google accounts
2. Each should maintain separate profiles

## 🔧 Advanced Configuration

### Custom Domain (Production)
If you have a custom domain, update these:

1. **Firebase Hosting Configuration:**
```json
{
  "hosting": {
    "public": "dist",
    "site": "your-custom-domain"
  }
}
```

2. **Update OAuth Settings:**
- Add custom domain to authorized origins
- Update redirect URIs with custom domain

### Environment Variables (Optional)
Create `.env.local` for additional security:
```bash
VITE_FIREBASE_AUTH_DOMAIN=swachhsaarthi.firebaseapp.com
VITE_GOOGLE_CLIENT_ID=your-client-id
```

## 📞 Support

If you encounter issues:

1. **Check Browser Console** for detailed error messages
2. **Verify Configuration** using the steps above
3. **Test with Incognito Mode** to rule out cache issues
4. **Check Firebase Console** for authentication logs

### Useful Links
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/web/google-signin)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Console](https://console.firebase.google.com/project/swachhsaarthi)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ Verification Checklist

Before going live, ensure:
- [ ] Google sign-in works in development
- [ ] User profiles are created correctly
- [ ] Automatic redirection works
- [ ] Error handling is proper
- [ ] OAuth consent screen is complete
- [ ] All domains are authorized
- [ ] Test users can access the application
