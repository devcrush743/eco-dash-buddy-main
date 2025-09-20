# Firestore Database Schema

## Collections Structure

### `reports/{reportId}`
Stores citizen-reported waste management issues.

```typescript
interface Report {
  reportId: string;                    // Auto-generated document ID
  description: string;                 // Issue description from citizen
  reporterId: string;                  // User ID who reported (reference to users collection)
  imageUrl?: string;                   // Firebase Storage URL of geo-stamped image (optional)
  coords: {                           // GPS coordinates where issue was reported
    lat: number;
    lng: number;
  };
  reportedAt: Timestamp;              // When the report was created
  status: 'open' | 'assigned' | 'collected' | 'approved' | 'rejected';
  assignedRouteId?: string;           // Reference to routes collection (if assigned to route)
  priority: 'normal' | 'redflag';     // Priority level
  collectedAt?: Timestamp;            // When driver marked as collected
  approvedAt?: Timestamp;             // When citizen approved collection
  driverId?: string;                  // Assigned driver (reference to users collection)
  rejectionReason?: string;           // If rejected by citizen, reason why
}
```

**Indexes needed:**
- `reporterId` (for citizen's reports list)
- `status` (for filtering open/assigned reports)
- `priority` + `status` (for driver priority filtering)
- `assignedRouteId` (for route management)
- `coords` (for geo-queries if needed)

### `routes/{routeId}`
Stores optimized driver routes with multiple stops.

```typescript
interface Route {
  routeId: string;                    // Auto-generated document ID
  driverId: string;                   // Driver assigned to this route
  createdAt: Timestamp;               // When route was created
  stops: RouteStop[];                 // Ordered list of stops
  polyline: LatLng[] | string;        // Route path (array of coordinates or encoded string)
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  meta: {
    totalDistanceMeters: number;      // Total route distance
    estimatedDurationSec: number;     // Estimated time to complete
    actualDurationSec?: number;       // Actual completion time
  };
  startedAt?: Timestamp;              // When driver started the route
  completedAt?: Timestamp;            // When route was completed
  currentStopIndex: number;           // Current stop driver is at (0-based)
}

interface RouteStop {
  reportId: string;                   // Reference to reports collection
  lat: number;                        // Stop coordinates
  lng: number;
  sequence: number;                   // Order in route (1, 2, 3...)
  eta?: number;                       // Estimated time to reach (seconds from start)
  arrivedAt?: Timestamp;              // When driver arrived at stop
  completedAt?: Timestamp;            // When stop was marked complete
  status: 'pending' | 'arrived' | 'completed' | 'skipped';
}
```

**Indexes needed:**
- `driverId` + `status` (for driver's active routes)
- `status` (for admin monitoring)
- `createdAt` (for chronological sorting)

### `users/{userId}`
Enhanced user profiles with location and notification support.

```typescript
interface UserProfile {
  uid: string;                        // Firebase Auth UID
  email: string;                      // User email
  displayName: string;                // Display name
  userType: 'citizen' | 'driver' | 'admin';
  driverId?: string;                  // Municipal driver ID (for drivers only)
  photoURL?: string;                  // Profile photo
  points?: number;                    // Gamification points (citizens)
  rank?: string;                      // User rank/level
  lastLocation?: {                    // Last known location
    lat: number;
    lng: number;
    updatedAt: Timestamp;
  };
  notificationToken?: string;         // FCM token for push notifications
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
  stats?: {                          // User statistics
    reportsSubmitted?: number;       // For citizens
    reportsApproved?: number;
    routesCompleted?: number;        // For drivers
    totalDistanceCovered?: number;
  };
}
```

**Indexes needed:**
- `userType` (for role-based queries)
- `driverId` (for driver lookup)
- `lastActiveAt` (for admin monitoring)

### `notifications/{notificationId}`
System notifications for users.

```typescript
interface Notification {
  notificationId: string;
  userId: string;                     // Target user
  type: 'report_collected' | 'report_approved' | 'route_assigned' | 'route_completed';
  title: string;
  message: string;
  data?: {                           // Additional data based on type
    reportId?: string;
    routeId?: string;
    actionRequired?: boolean;        // If user action needed (approve/reject)
  };
  createdAt: Timestamp;
  readAt?: Timestamp;
  actionedAt?: Timestamp;            // If user took action
}
```

**Indexes needed:**
- `userId` + `readAt` (for unread notifications)
- `userId` + `createdAt` (for chronological listing)

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        resource.data.userType in ['driver', 'admin']; // Drivers can see other users for assignments
    }
    
    // Reports - citizens can create and read their own, drivers can read all open reports
    match /reports/{reportId} {
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.reporterId;
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.reporterId || // Own reports
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType in ['driver', 'admin'] // Drivers/admins can see all
      );
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.reporterId || // Citizens can approve/reject
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType in ['driver', 'admin'] // Drivers can update status
      );
    }
    
    // Routes - only drivers and admins can access
    match /routes/{routeId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType in ['driver', 'admin'];
    }
    
    // Notifications - users can read their own
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Report images - citizens can upload, everyone authenticated can read
    match /reports/{reportId}/{fileName} {
      allow write: if request.auth != null && 
        request.auth.uid == resource.metadata.uploadedBy;
      allow read: if request.auth != null;
    }
    
    // Profile images
    match /profiles/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Composite Indexes Required

Add these in Firebase Console → Firestore → Indexes:

1. **Reports Collection:**
   - `status` (Ascending) + `priority` (Descending) + `reportedAt` (Descending)
   - `reporterId` (Ascending) + `reportedAt` (Descending)
   - `assignedRouteId` (Ascending) + `status` (Ascending)

2. **Routes Collection:**
   - `driverId` (Ascending) + `status` (Ascending) + `createdAt` (Descending)
   - `status` (Ascending) + `createdAt` (Descending)

3. **Notifications Collection:**
   - `userId` (Ascending) + `readAt` (Ascending) + `createdAt` (Descending)

## Data Validation

Use Firestore rules or client-side validation:

- **Coordinates:** Validate lat (-90 to 90) and lng (-180 to 180)
- **Status transitions:** Enforce valid state transitions (open → assigned → collected → approved/rejected)
- **Required fields:** Ensure all required fields are present
- **File size limits:** Limit image uploads to reasonable sizes (e.g., 10MB)
- **Rate limiting:** Prevent spam reports from same user

## Migration Strategy

For existing data:
1. Create new collections alongside existing ones
2. Run migration scripts to transform data
3. Update client code to use new schema
4. Remove old collections after validation
