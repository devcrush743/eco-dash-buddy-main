/**
 * Driver Location Service
 * Automatically captures driver location and updates Firestore
 */

import { doc, updateDoc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get current location using browser geolocation API
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        };
        resolve(location);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Update driver location in Firestore
 */
export const updateDriverLocation = async (driverId, location) => {
  try {
    const driversQuery = query(collection(db, 'drivers'), where('driverId', '==', driverId.toUpperCase()));
    const found = await getDocs(driversQuery);
    if (found.empty) {
      throw new Error('Driver not found. Your user is not linked to a driver profile.');
    }
    const driverRef = found.docs[0].ref;
    const driverDoc = await getDoc(driverRef);
    
    if (driverDoc.exists()) {
      // Update existing driver
      await updateDoc(driverRef, {
        baseLocation: {
          lat: location.lat,
          lng: location.lng
        },
        lastLocationUpdate: location.timestamp,
        locationAccuracy: location.accuracy,
        active: true, // Ensure driver is active for route optimization
        maxCapacity: driverDoc.data().maxCapacity || 25.0 // Default capacity if not set
      });
      console.log('✅ Driver location updated successfully');
    } else {
      // Do NOT auto-create; prevent duplicates and mis-linked accounts
      throw new Error('Driver not found. Your user is not linked to a driver profile.');
    }
    
    return {
      success: true,
      location: location
    };
    
  } catch (error) {
    console.error('❌ Failed to update driver location:', error);
    throw error;
  }
};

/**
 * Automatically capture and save driver location
 */
export const captureDriverLocation = async (driverId) => {
  try {
    console.log('📍 Capturing driver location...');
    
    // Get current location
    const location = await getCurrentLocation();
    console.log('📍 Location captured:', location);
    
    // Update driver in Firestore
    const result = await updateDriverLocation(driverId, location);
    
    return {
      success: true,
      message: 'Location captured and saved successfully',
      location: location
    };
    
  } catch (error) {
    console.error('❌ Failed to capture driver location:', error);
    return {
      success: false,
      message: error.message,
      location: null
    };
  }
};

/**
 * Check if driver has valid location data
 */
export const checkDriverLocationData = async (driverId) => {
  try {
    const driversQuery = query(collection(db, 'drivers'), where('driverId', '==', driverId.toUpperCase()));
    const found = await getDocs(driversQuery);
    if (found.empty) {
      return { hasLocation: false, message: 'Driver document not found' };
    }
    const driverRef = found.docs[0].ref;
    const driverDoc = await getDoc(driverRef);
    
    if (!driverDoc.exists()) {
      return {
        hasLocation: false,
        message: 'Driver document not found'
      };
    }
    
    const data = driverDoc.data();
    const hasBaseLocation = data.baseLocation && 
                           typeof data.baseLocation.lat === 'number' && 
                           typeof data.baseLocation.lng === 'number';
    
    const isActive = data.active === true;
    
    return {
      hasLocation: hasBaseLocation,
      isActive: isActive,
      hasAllRequiredFields: hasBaseLocation && isActive,
      message: hasBaseLocation ? 'Driver has valid location data' : 'Driver missing location data'
    };
    
  } catch (error) {
    console.error('❌ Failed to check driver location:', error);
    return {
      hasLocation: false,
      message: 'Failed to check driver data'
    };
  }
};

/**
 * Auto-setup driver for route optimization
 * Captures location and ensures all required fields are present
 */
export const autoSetupDriverForOptimization = async (driverId, driverName = null) => {
  try {
    console.log('🚛 Auto-setting up driver for route optimization...');
    
    // Check current driver data
    const currentData = await checkDriverLocationData(driverId);
    
    if (currentData.hasAllRequiredFields) {
      console.log('✅ Driver already has all required data');
      return {
        success: true,
        message: 'Driver is ready for route optimization',
        needsLocation: false
      };
    }
    
    // Capture location (will fail if driver doc doesn't exist)
    const locationResult = await captureDriverLocation(driverId);
    
    if (!locationResult.success) {
      throw new Error(locationResult.message);
    }
    
    // Update additional fields if needed
    const driverRef = doc(db, 'drivers', driverId);
    const updateData = {};
    
    if (driverName) {
      updateData.name = driverName;
    }
    
    // Ensure maxCapacity is set
    const driverDoc = await getDoc(driverRef);
    if (driverDoc.exists() && !driverDoc.data().maxCapacity) {
      updateData.maxCapacity = 25.0; // Default capacity
    }
    
    if (Object.keys(updateData).length > 0) {
      await updateDoc(driverRef, updateData);
    }
    
    console.log('✅ Driver auto-setup completed successfully');
    
    return {
      success: true,
      message: 'Driver location captured and setup completed',
      location: locationResult.location,
      needsLocation: false
    };
    
  } catch (error) {
    console.error('❌ Auto-setup failed:', error);
    return {
      success: false,
      message: error.message,
      needsLocation: true
    };
  }
};

/**
 * Log driver check-in to Firestore (cloud record)
 * - Updates drivers/{driverId} onDuty=true and timestamps
 * - Adds a document to drivers/{driverId}/checkins
 */
export const logDriverCheckIn = async (driverId, location) => {
  const driversQuery = query(collection(db, 'drivers'), where('driverId', '==', driverId.toUpperCase()));
  const found = await getDocs(driversQuery);
  if (found.empty) {
    throw new Error('Driver not found for check-in');
  }
  const driverRef = found.docs[0].ref;
  const driverDoc = await getDoc(driverRef);
  if (!driverDoc.exists()) {
    throw new Error('Driver not found for check-in');
  }
  await updateDoc(driverRef, {
    onDuty: true,
    lastCheckInAt: new Date(),
  });

  const checkinsRef = collection(driverRef, 'checkins');
  await addDoc(checkinsRef, {
    type: 'checkin',
    at: serverTimestamp(),
  });
};

/**
 * Log driver check-out to Firestore
 */
export const logDriverCheckOut = async (driverId) => {
  const driversQuery = query(collection(db, 'drivers'), where('driverId', '==', driverId.toUpperCase()));
  const found = await getDocs(driversQuery);
  if (found.empty) {
    throw new Error('Driver not found for check-out');
  }
  const driverRef = found.docs[0].ref;
  const driverDoc = await getDoc(driverRef);
  if (!driverDoc.exists()) {
    throw new Error('Driver not found for check-out');
  }
  await updateDoc(driverRef, {
    onDuty: false,
    lastCheckOutAt: new Date(),
  });

  const checkinsRef = collection(driverRef, 'checkins');
  await addDoc(checkinsRef, {
    type: 'checkout',
    at: serverTimestamp(),
  });
};
