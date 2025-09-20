// 🔐 ADMIN PASSWORD: BetaWasteAdmin@2025
// Driver Management Firestore Helper Functions

import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Driver {
  id: string;
  driverId: string; // e.g., DRV001
  name: string;
  password: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt?: any;
}

export interface CreateDriverData {
  driverId: string;
  name: string;
  password?: string; // Optional, defaults to "driver123"
}

// 🔑 HARDCODED ADMIN PASSWORD
export const ADMIN_PASSWORD = "BetaWasteAdmin@2025";

// Default driver password
export const DEFAULT_DRIVER_PASSWORD = "driver123";

/**
 * Create a new driver account
 */
export const createDriver = async (driverData: CreateDriverData): Promise<string> => {
  try {
    console.log(`🔍 Creating driver:`, driverData);
    
    // Check if driver ID already exists
    const existingDriver = await getDriverByDriverId(driverData.driverId);
    if (existingDriver) {
      console.log(`❌ Driver already exists: ${driverData.driverId}`);
      throw new Error(`Driver ID ${driverData.driverId} already exists`);
    }

    const newDriver = {
      driverId: driverData.driverId.toUpperCase(),
      name: driverData.name.trim(),
      password: driverData.password || DEFAULT_DRIVER_PASSWORD,
      status: 'active' as const,
      createdAt: serverTimestamp(),
    };

    console.log(`🔍 New driver object:`, newDriver);

    const docRef = await addDoc(collection(db, 'drivers'), newDriver);
    console.log(`✅ Driver created successfully: ${driverData.driverId} (Firestore ID: ${docRef.id})`);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating driver:', error);
    throw error;
  }
};

/**
 * Get all drivers with real-time updates
 */
export const listenToDrivers = (callback: (drivers: Driver[]) => void) => {
  const driversQuery = query(
    collection(db, 'drivers'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(driversQuery, (snapshot) => {
    const drivers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Driver[];
    
    callback(drivers);
  }, (error) => {
    console.error('Error listening to drivers:', error);
    callback([]);
  });
};

/**
 * Get all drivers (one-time fetch)
 */
export const getAllDrivers = async (): Promise<Driver[]> => {
  try {
    const driversQuery = query(
      collection(db, 'drivers'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(driversQuery);
    const drivers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Driver[];
    
    return drivers;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
};

/**
 * Get driver by driver ID (for login)
 */
export const getDriverByDriverId = async (driverId: string): Promise<Driver | null> => {
  try {
    const driversQuery = query(
      collection(db, 'drivers'),
      where('driverId', '==', driverId.toUpperCase())
    );
    
    const snapshot = await getDocs(driversQuery);
    
    // Warn if duplicates exist for the same driverId
    if (!snapshot.empty && snapshot.size > 1) {
      console.warn(`⚠️ Detected ${snapshot.size} driver documents with driverId=${driverId}. Document IDs:`, snapshot.docs.map(d => d.id));
    }
    
    if (snapshot.empty) {
      return null;
    }
    
    const driverDoc = snapshot.docs[0];
    return {
      id: driverDoc.id,
      ...driverDoc.data()
    } as Driver;
  } catch (error) {
    console.error('Error fetching driver by ID:', error);
    return null;
  }
};

/**
 * Check duplicates for a given driverId
 */
export const checkDuplicateDriverId = async (driverId: string): Promise<{ count: number; docIds: string[] }> => {
  try {
    const driversQuery = query(
      collection(db, 'drivers'),
      where('driverId', '==', driverId.toUpperCase())
    );
    const snapshot = await getDocs(driversQuery);
    return { count: snapshot.size, docIds: snapshot.docs.map(d => d.id) };
  } catch (error) {
    console.error('Error checking duplicate driverId:', error);
    return { count: 0, docIds: [] };
  }
};

/**
 * Update driver details
 */
export const updateDriver = async (
  driverId: string, 
  updates: Partial<Omit<Driver, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const driverRef = doc(db, 'drivers', driverId);
    
    await updateDoc(driverRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Driver updated: ${driverId}`);
  } catch (error) {
    console.error('Error updating driver:', error);
    throw error;
  }
};

/**
 * Toggle driver status (active/inactive)
 */
export const toggleDriverStatus = async (driverId: string): Promise<void> => {
  try {
    const driverRef = doc(db, 'drivers', driverId);
    const driverDoc = await getDoc(driverRef);
    
    if (!driverDoc.exists()) {
      throw new Error('Driver not found');
    }
    
    const currentStatus = driverDoc.data().status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    await updateDoc(driverRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Driver status toggled: ${driverId} → ${newStatus}`);
  } catch (error) {
    console.error('Error toggling driver status:', error);
    throw error;
  }
};

/**
 * Delete driver
 */
export const deleteDriver = async (driverId: string): Promise<void> => {
  try {
    const driverRef = doc(db, 'drivers', driverId);
    await deleteDoc(driverRef);
    
    console.log(`✅ Driver deleted: ${driverId}`);
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
};

/**
 * Authenticate driver login
 */
export const authenticateDriver = async (
  driverId: string, 
  password: string
): Promise<{ success: boolean; driver?: Driver; error?: string }> => {
  try {
    // Check for duplicates first
    const dup = await checkDuplicateDriverId(driverId);
    if (dup.count > 1) {
      console.error(`❌ Duplicate driverId detected for ${driverId}:`, dup.docIds);
      return {
        success: false,
        error: `Duplicate Driver ID found (${dup.count}). Contact admin to merge/delete duplicates.`
      };
    }

    console.log(`🔍 Looking for driver: ${driverId}`);
    const driver = await getDriverByDriverId(driverId);
    
    console.log(`🔍 Driver lookup result:`, driver);
    
    if (!driver) {
      console.log(`❌ Driver not found: ${driverId}`);
      return {
        success: false,
        error: 'Driver ID not found'
      };
    }
    
    console.log(`🔍 Checking password for ${driverId}: provided="${password}", stored="${driver.password}"`);
    if (driver.password !== password) {
      console.log(`❌ Password mismatch for ${driverId}`);
      return {
        success: false,
        error: 'Invalid password'
      };
    }
    
    console.log(`🔍 Checking status for ${driverId}: ${driver.status}`);
    if (driver.status !== 'active') {
      console.log(`❌ Driver inactive: ${driverId}`);
      return {
        success: false,
        error: 'Driver account is inactive. Contact admin.'
      };
    }
    
    console.log(`✅ Driver authenticated: ${driverId}`);
    return {
      success: true,
      driver
    };
  } catch (error) {
    console.error('❌ Error authenticating driver:', error);
    return {
      success: false,
      error: 'Authentication failed. Please try again.'
    };
  }
};

/**
 * Validate admin password
 */
export const validateAdminPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};

/**
 * Generate next driver ID
 */
export const generateDriverId = async (): Promise<string> => {
  try {
    const drivers = await getAllDrivers();
    const lastDriverId = drivers
      .map(d => d.driverId)
      .filter(id => id.startsWith('DRV'))
      .map(id => parseInt(id.substring(3)))
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a)[0] || 0;
    
    const nextId = lastDriverId + 1;
    return `DRV${nextId.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating driver ID:', error);
    return 'DRV001';
  }
};

/**
 * Driver statistics
 */
export const getDriverStats = async () => {
  try {
    const drivers = await getAllDrivers();
    
    return {
      total: drivers.length,
      active: drivers.filter(d => d.status === 'active').length,
      inactive: drivers.filter(d => d.status === 'inactive').length,
      createdToday: drivers.filter(d => {
        if (!d.createdAt) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const createdDate = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
        return createdDate >= today;
      }).length
    };
  } catch (error) {
    console.error('Error fetching driver stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      createdToday: 0
    };
  }
};
