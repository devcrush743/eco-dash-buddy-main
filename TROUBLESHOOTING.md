# Troubleshooting Guide

## 🚨 **Fixed Issues**

### ✅ **1. Image Processing Stack Overflow**
**Problem**: `Maximum call stack size exceeded` in `imageUtils.ts`

**Solution**: Fixed recursive function call in image stamping utility. The issue was in lines 92-94 where `img.onload` was calling itself recursively.

**What was changed**:
- Removed recursive call to `img.onload()`
- Moved `URL.revokeObjectURL()` to proper locations
- Added proper error handling

### ✅ **2. Firestore Permission Issues**
**Problem**: `400 error` when uploading reports to Firestore

**Solutions Applied**:
1. **Created permissive Firestore rules** (`firestore.rules`)
2. **Created Storage rules** (`storage.rules`)
3. **Added error handling** for user stats updates
4. **Made stats update optional** (won't fail entire operation)

## 🛠️ **Firebase Setup Steps**

### **Step 1: Apply Firestore Rules**
1. Go to [Firebase Console](https://console.firebase.google.com/project/swachhsaarthi)
2. Click **Firestore Database** → **Rules**
3. Copy the content from `firestore.rules` file
4. Click **Publish**

### **Step 2: Apply Storage Rules**
1. Go to **Storage** → **Rules**
2. Copy the content from `storage.rules` file
3. Click **Publish**

### **Step 3: Enable Storage**
1. Go to **Storage** → **Get started**
2. Choose **Start in test mode**
3. Select your preferred location
4. Click **Done**

### **Step 4: Test the Fix**
1. Refresh your browser
2. Try submitting a report with photo
3. Check browser console for any remaining errors

## 🔍 **Debugging Steps**

### **Check Browser Console**
```javascript
// Open Developer Tools (F12) and run:
console.log('Firebase Auth:', firebase.auth().currentUser);
console.log('Firestore:', firebase.firestore().app.name);
```

### **Verify Permissions**
1. **Location**: Browser should prompt for location access
2. **Camera**: Should be able to select/take photos
3. **Firebase**: Should see successful uploads in console

### **Common Error Messages & Solutions**

#### **"Permission denied" (Firestore)**
```
Solution: Apply the firestore.rules from the project
Go to Firebase Console → Firestore → Rules → Publish
```

#### **"Storage object does not exist"**
```
Solution: Enable Firebase Storage
Go to Firebase Console → Storage → Get started
```

#### **"Failed to get location"**
```
Solution: Allow location access in browser
Click the location icon in address bar → Allow
```

#### **"Failed to load image"**
```
Solution: Try with a different image format
Supported: JPEG, PNG, WebP (max 10MB)
```

## 🎯 **Testing Checklist**

### **Report Submission Flow**
- [ ] Can fill out description
- [ ] Can set priority (Normal/Urgent)
- [ ] Can capture location successfully
- [ ] Can select/take photo
- [ ] Photo preview shows correctly
- [ ] Form submits without errors
- [ ] Report appears in "Recent Reports"
- [ ] Image is geo-stamped with coordinates

### **Real-time Updates**
- [ ] New reports appear immediately
- [ ] Status changes reflect in real-time
- [ ] Multiple browser tabs sync correctly

### **Error Handling**
- [ ] Form shows validation errors
- [ ] Network errors are handled gracefully
- [ ] File upload errors are caught
- [ ] Location errors show helpful messages

## 📱 **Mobile Testing**

### **Device Features**
- [ ] Camera access works
- [ ] GPS location works
- [ ] Touch interactions responsive
- [ ] Forms work in landscape/portrait
- [ ] Images display correctly

### **Performance**
- [ ] App loads quickly
- [ ] Images compress properly
- [ ] Smooth animations
- [ ] No memory leaks

## 🔧 **Development Tools**

### **Firebase Emulator (Optional)**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators
firebase init emulators

# Start local development
firebase emulators:start
```

### **Console Debugging**
```javascript
// Test Firebase connection
console.log('Auth state:', firebase.auth().currentUser);
console.log('App name:', firebase.app().name);

// Test image processing
import { stampImageWithMeta } from './src/utils/imageUtils';
// Use in browser console to debug image issues
```

## 📋 **Production Checklist**

Before going live:
- [ ] Update Firestore rules with proper security
- [ ] Update Storage rules with size limits
- [ ] Enable Firebase Analytics
- [ ] Set up monitoring and alerts
- [ ] Test with real devices
- [ ] Verify all permissions work
- [ ] Test offline functionality
- [ ] Performance optimization

## 💡 **Performance Tips**

### **Image Optimization**
- Images are automatically compressed to reduce upload time
- GPS stamping adds minimal overhead
- Use WebP format for better compression

### **Real-time Updates**
- Firestore listeners are optimized for minimal data transfer
- Updates only send changed fields
- Automatic connection management

### **Caching**
- Images are cached in browser
- Location is cached for 1 minute
- Form data persists during network issues

## 🆘 **Getting Help**

If you're still experiencing issues:

1. **Check Browser Console**: Look for specific error messages
2. **Verify Firebase Setup**: Ensure all services are enabled
3. **Test with Different Browsers**: Chrome works best with Firebase
4. **Clear Browser Cache**: Sometimes helps with configuration issues
5. **Try Incognito Mode**: Eliminates extension conflicts

The system should now work smoothly without the stack overflow error and with proper Firebase permissions! 🎉
