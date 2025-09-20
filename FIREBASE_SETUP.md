# Firebase Setup for Swachh Saarthi

This document explains how to set up Firebase authentication for the Swachh Saarthi waste management application.

## Prerequisites

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database

## Step 1: Configure Firebase Project

1. Go to the Firebase Console
2. Create a new project or select existing one
3. Enable the following services:
   - **Authentication** (Email/Password and Google Sign-in)
   - **Firestore Database**

## Step 2: Get Firebase Configuration

1. Go to Project Settings → General
2. Scroll down to "Your apps" section
3. Add a new web app or select existing one
4. Copy the Firebase configuration object

## Step 3: Update Firebase Config

Replace the placeholder values in `src/config/firebase.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 4: Enable Authentication Methods

1. Go to Authentication → Sign-in method
2. Enable **Email/Password** authentication
3. Enable **Google** authentication
   - Add your domain to authorized domains
   - Configure OAuth consent screen

## Step 5: Set Up Firestore Rules

Go to Firestore Database → Rules and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Complaints collection - users can create and read their own
    match /complaints/{complaintId} {
      allow read, write: if request.auth != null;
    }
    
    // Tasks collection - drivers can read and update
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 6: Create Driver Accounts (Development)

For development and testing, you can create initial driver accounts:

1. Open browser console on your app
2. Import the setup function:
   ```javascript
   import { setupInitialDrivers } from './src/utils/setupDrivers.ts';
   setupInitialDrivers();
   ```

This will create 5 test driver accounts:
- **001


## Authentication Flow

### Citizens
- Can sign up with Google OAuth
- Can sign up with email/password
- Can sign in with email/password
- Automatically assigned "citizen" user type

### Drivers
- Use special Driver ID format (DRV001, DRV002, etc.)
- Email format: `driverId@drivers.swachhsaarthi.com`
- Must be pre-created by administrators
- Assigned "driver" user type

## User Profile Structure

```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  userType: 'citizen' | 'driver';
  driverId?: string; // Only for drivers
  photoURL?: string;
  points?: number;
  rank?: string;
}
```

## Testing the Setup

1. Start the development server: `npm run dev`
2. Try sigDRVning up as a citizen with Google or email
3. Try signing in as a driver with one of the test accounts
4. Verify that protected routes work correctly

## Production Considerations

1. **Security Rules**: Update Firestore rules for production security
2. **Driver Management**: Create admin interface for managing driver accounts
3. **Email Verification**: Enable email verification for citizen accounts
4. **Password Policy**: Implement stronger password requirements
5. **Rate Limiting**: Configure Firebase Auth rate limiting
6. **Monitoring**: Set up Firebase Analytics and Crashlytics

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your domain is added to Firebase authorized domains
2. **Permission Denied**: Check Firestore security rules
3. **Invalid API Key**: Verify Firebase configuration values
4. **Auth State Not Persisting**: Check that AuthProvider wraps your app
5. **Driver Login Failing**: Ensure driver accounts are created with correct email format

### Environment Variables (Optional)

For added security, you can use environment variables:

```bash
# .env.local
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other config values
```

Then update `firebase.ts` to use these variables.

## Support

If you encounter issues with Firebase setup, check:
1. Firebase Console for error logs
2. Browser developer tools for authentication errors
3. Firestore rules simulator for permission issues
