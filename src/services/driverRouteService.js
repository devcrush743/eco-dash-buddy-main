/**
 * Driver-Specific Route Service
 * Handles clustering and assignment of locations to individual drivers
 */

import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get driver-specific optimized locations
 * This clusters all open reports and assigns the current driver's cluster
 */
export const getDriverOptimizedLocations = async (driverId) => {
  try {
    console.log('🔍 Fetching driver-specific locations for:', driverId);
    
    // Get all open reports
    const [openReports, availableDrivers] = await Promise.all([
      getOpenReports(),
      getAvailableDrivers()
    ]);
    
    console.log(`📊 Found ${openReports.length} open reports and ${availableDrivers.length} available drivers`);
    
    if (openReports.length === 0) {
      throw new Error('No open reports found for optimization');
    }
    
    if (availableDrivers.length === 0) {
      throw new Error('No available drivers found');
    }
    
    // Find current driver
    const currentDriver = availableDrivers.find(d => d.driverId === driverId);
    if (!currentDriver) {
      throw new Error('Driver not found in available drivers list');
    }
    
    // Convert to optimization format
    const pickupData = convertReportsToPickupData(openReports);
    const driverData = convertDriversToDriverData(availableDrivers);
    
    // Run clustering and get driver-specific locations
    const driverLocations = await callDriverSpecificOptimization(pickupData, driverData, driverId);
    
    console.log('✅ Driver-specific locations retrieved successfully');
    return driverLocations;
    
  } catch (error) {
    console.error('❌ Failed to get driver locations:', error);
    throw error;
  }
};

/**
 * Get all open reports from Firestore
 */
const getOpenReports = async () => {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', 'in', ['open', 'reported', 'pending'])
    );
    
    const querySnapshot = await getDocs(reportsQuery);
    const reports = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data
      });
    });
    
    return reports;
  } catch (error) {
    console.error('Error fetching open reports:', error);
    throw error;
  }
};

/**
 * Get all available drivers from Firestore
 */
const getAvailableDrivers = async () => {
  try {
    const driversQuery = query(
      collection(db, 'drivers'),
      where('active', '==', true)
    );
    
    const querySnapshot = await getDocs(driversQuery);
    const drivers = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      drivers.push({
        id: doc.id,
        ...data
      });
    });
    
    return drivers;
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    throw error;
  }
};

/**
 * Convert Firestore reports to pickup points format
 */
const convertReportsToPickupData = (reports) => {
  return reports
    .filter(report => {
      return report.coords && 
             typeof report.coords.lat === 'number' && 
             typeof report.coords.lng === 'number';
    })
    .map(report => {
      let priority = report.priority || 'green';
      if (!['red', 'yellow', 'green'].includes(priority)) {
        if (report.urgent || (report.description && report.description.toLowerCase().includes('urgent'))) {
          priority = 'red';
        } else if (report.description && report.description.toLowerCase().includes('moderate')) {
          priority = 'yellow';
        } else {
          priority = 'green';
        }
      }
      
      return {
        pickup_id: report.id,
        lat: report.coords.lat,
        lng: report.coords.lng,
        priority_flag: priority,
        volume: estimateVolumeFromDescription(report.description),
        description: report.description || 'Waste collection point'
      };
    });
};

/**
 * Convert Firestore drivers to driver data format
 */
const convertDriversToDriverData = (drivers) => {
  return drivers
    .filter(driver => {
      return driver.baseLocation && 
             typeof driver.baseLocation.lat === 'number' && 
             typeof driver.baseLocation.lng === 'number';
    })
    .map(driver => ({
      driver_id: driver.driverId || driver.id,
      base_lat: driver.baseLocation.lat,
      base_lng: driver.baseLocation.lng,
      max_capacity: driver.maxCapacity || driver.vehicleCapacity || 50.0,
      name: driver.name || driver.driverName || 'Unknown Driver'
    }));
};

/**
 * Estimate waste volume based on description
 */
const estimateVolumeFromDescription = (description) => {
  if (!description) return 2.0;
  
  const desc = description.toLowerCase();
  const highVolumeKeywords = ['overflowing', 'full', 'large', 'market', 'commercial', 'school'];
  const mediumVolumeKeywords = ['medium', 'normal', 'regular', 'residential'];
  
  const baseVolume = 2.0;
  
  if (highVolumeKeywords.some(keyword => desc.includes(keyword))) {
    return baseVolume * 1.5; // 3.0 m³
  } else if (mediumVolumeKeywords.some(keyword => desc.includes(keyword))) {
    return baseVolume; // 2.0 m³
  } else {
    return baseVolume * 0.75; // 1.5 m³
  }
};

/**
 * Call Python optimization for driver-specific clustering
 * Updated: Using Railway backend URL for production
 * FORCE REBUILD: This should fix the localhost issue
 */
const callDriverSpecificOptimization = async (pickupData, driverData, targetDriverId) => {
  try {
    // Railway backend URL - hardcoded for production
    const API_BASE_URL = 'https://swachsaarthi-production.up.railway.app';
    
    console.log('🚛 Calling driver-specific optimization API...');
    console.log('🔗 Using Railway backend:', API_BASE_URL);
    console.log('🔄 FORCE REBUILD - This should fix localhost issue');
    
    const requestBody = {
      pickup_points: pickupData,
      drivers: driverData,
      target_driver_id: targetDriverId,
      options: {
        priority_weight: 0.4,
        distance_weight: 0.4,
        balance_weight: 0.2
      }
    };
    
    const response = await fetch(`${API_BASE_URL}/optimize-driver`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Driver-specific optimization completed');
    return result;
    
  } catch (error) {
    console.error('❌ Driver-specific optimization failed:', error.message);
    throw error;
  }
};

/**
 * Generate Google Maps URL with multiple destinations
 */
export const generateGoogleMapsRoute = (locations, driverBaseLocation) => {
  if (!locations || locations.length === 0) {
    return null;
  }
  
  // Start with driver's base location
  let url = 'https://www.google.com/maps/dir/';
  
  // Add driver base location as starting point
  url += `${driverBaseLocation.lat},${driverBaseLocation.lng}/`;
  
  // Add all assigned locations as destinations
  locations.forEach((location, index) => {
    url += `${location.lat},${location.lng}`;
    if (index < locations.length - 1) {
      url += '/';
    }
  });
  
  // Add parameters for optimization
  url += '/data=!3m1!4b1!4m2!4m1!3e0';
  
  return url;
};

/**
 * Update report assignments for driver
 */
export const updateDriverReportAssignments = async (driverId, assignedLocations) => {
  try {
    const updates = [];
    
    assignedLocations.forEach((location, index) => {
      updates.push(
        updateDoc(doc(db, 'reports', location.pickup_id), {
          status: 'assigned',
          driverId: driverId,
          assignedAt: new Date(),
          routeOrder: index + 1,
          totalStops: assignedLocations.length
        })
      );
    });
    
    await Promise.all(updates);
    console.log(`✅ Updated ${updates.length} report assignments for driver ${driverId}`);
    
  } catch (error) {
    console.error('❌ Failed to update driver report assignments:', error);
    throw error;
  }
};
