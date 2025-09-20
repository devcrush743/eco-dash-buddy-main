# Netlify Deployment Guide for Swachh Saarthi

This guide helps you deploy the Swachh Saarthi waste management application to Netlify with proper authentication functionality.

## Prerequisites

1. A Netlify account
2. A Firebase project with Authentication and Firestore enabled
3. Your Firebase configuration values

## Step 1: Firebase Configuration for Production

### 1.1 Add Your Domain to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add your Netlify domain (e.g., `your-app-name.netlify.app`)
5. If using a custom domain, add that as well

### 1.2 Update Firebase Configuration (Optional)

For added security, you can use environment variables instead of hardcoded values:

1. In Netlify, go to **Site settings** → **Environment variables**
2. Add the following variables:
   ```
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

## Step 2: Deploy to Netlify

### Option A: Deploy from Git Repository

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. In Netlify, click **"New site from Git"**
3. Connect your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`
5. Click **"Deploy site"**

### Option B: Manual Deploy

1. Run the build command locally:
   ```bash
   npm run build
   ```
2. Drag and drop the `dist` folder to Netlify's deploy area

## Step 3: Configure Site Settings

### 3.1 Build Settings
In Netlify site settings, ensure:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### 3.2 Environment Variables (if using)
Add your Firebase configuration variables in **Site settings** → **Environment variables**

## Step 4: Test Authentication

1. Visit your deployed site
2. Test citizen login with Google OAuth
3. Test citizen email/password registration and login
4. Test driver login functionality
5. Verify redirects work correctly after authentication

## Common Issues and Solutions

### Issue 1: "Firebase: Error (auth/unauthorized-domain)"

**Solution**: Add your Netlify domain to Firebase Authorized domains (see Step 1.1)

### Issue 2: Authentication state not persisting

**Solution**: Ensure the `_redirects` file is present in the `public` folder with the content:
```
/*    /index.html   200
```

### Issue 3: Routes return 404 after refresh

**Solution**: The `netlify.toml` and `_redirects` files have been added to handle SPA routing.

### Issue 4: Environment variables not working

**Solution**: 
1. Make sure environment variables in Netlify start with `VITE_`
2. Redeploy the site after adding environment variables
3. Check the browser console for configuration errors

### Issue 5: Build failures

**Solution**:
1. Ensure Node version is set to 18 in Netlify
2. Check for any TypeScript errors in the build logs
3. Verify all dependencies are properly installed

## Security Considerations

1. **Firebase Rules**: Ensure your Firestore security rules are properly configured for production
2. **Domain Restrictions**: Only add necessary domains to Firebase authorized domains
3. **Environment Variables**: Use environment variables for sensitive configuration in production
4. **HTTPS**: Netlify provides HTTPS by default, which is required for Firebase Auth

## Files Added/Modified for Netlify Deployment

1. **`public/_redirects`**: Handles SPA routing
2. **`netlify.toml`**: Netlify configuration file
3. **`src/config/firebase.ts`**: Updated to support environment variables
4. **`src/contexts/AuthContext.tsx`**: Fixed redirect handling for Netlify
5. **`src/App.tsx`**: Added proper auth redirect handling

## Testing Checklist

Before going live, verify:

- [ ] Firebase domain is authorized
- [ ] All authentication methods work (Google, email/password, driver login)
- [ ] Page refreshes don't break the app
- [ ] Direct URL navigation works for all routes
- [ ] User sessions persist across browser refreshes
- [ ] Redirects work after login/logout
- [ ] Error handling works properly

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify Firebase configuration in the console
3. Check Netlify function logs for build issues
4. Ensure all environment variables are properly set

For Firebase-specific issues, check the [Firebase Auth documentation](https://firebase.google.com/docs/auth/web/start).
