/**
 * Route Optimization Service
 * Handles communication between React frontend and Python route optimization module
 */

import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get all open/unassigned reports from Firestore
 */
export const getOpenReports = async () => {
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
export const getAvailableDrivers = async () => {
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
 * Convert Firestore reports to pickup points format
 */
export const convertReportsToPickupData = (reports) => {
  return reports
    .filter(report => {
      // Only include reports with valid coordinates
      return report.coords && 
             typeof report.coords.lat === 'number' && 
             typeof report.coords.lng === 'number';
    })
    .map(report => {
      // Determine priority
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
export const convertDriversToDriverData = (drivers) => {
  return drivers
    .filter(driver => {
      // Only include drivers with valid base locations
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
 * Call Python route optimization via Flask API
 */
export const callPythonOptimization = async (pickupData, driverData) => {
  try {
    const API_BASE_URL = 'http://localhost:5000';
    
    console.log('🚛 Calling route optimization API with data:', {
      pickup_points: pickupData.length,
      drivers: driverData.length
    });
    
    const requestBody = {
      pickup_points: pickupData,
      drivers: driverData,
      options: {
        priority_weight: 0.4,
        distance_weight: 0.4,
        balance_weight: 0.2
      }
    };
    
    const response = await fetch(`${API_BASE_URL}/optimize`, {
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
    console.log('✅ Route optimization completed via API');
    return result;
    
  } catch (error) {
    console.error('❌ Route optimization API failed:', error.message);
    throw error;
  }
};


/**
 * Main route optimization function
 */
export const optimizeDriverRoutes = async () => {
  try {
    console.log('🔍 Fetching open reports and available drivers...');
    
    // Get data from Firestore
    const [openReports, availableDrivers] = await Promise.all([
      getOpenReports(),
      getAvailableDrivers()
    ]);
    
    console.log(`📊 Found ${openReports.length} open reports and ${availableDrivers.length} available drivers`);
    
    if (openReports.length === 0) {
      throw new Error('No open reports found for optimization. Please add some reports with status "open" to your Firestore database.');
    }
    
    if (availableDrivers.length === 0) {
      throw new Error('No available drivers found for optimization. Please add drivers with active=true and valid baseLocation to your Firestore database.');
    }
    
    // Convert to optimization format
    const pickupData = convertReportsToPickupData(openReports);
    const driverData = convertDriversToDriverData(availableDrivers);
    
    console.log(`🔧 Converted ${pickupData.length} pickup points and ${driverData.length} drivers`);
    
    // Run optimization
    console.log('🚛 Running route optimization...');
    const optimizedRoutes = await callPythonOptimization(pickupData, driverData);
    
    console.log('✅ Route optimization completed successfully');
    
    return optimizedRoutes;
    
  } catch (error) {
    console.error('❌ Route optimization failed:', error);
    throw error;
  }
};

/**
 * Update report assignments based on optimization results
 */
export const updateReportAssignments = async (optimizationResult) => {
  try {
    const updates = [];
    
    Object.values(optimizationResult.driver_routes).forEach(route => {
      route.stops.forEach(stop => {
        updates.push(
          updateDoc(doc(db, 'reports', stop.pickup_id), {
            status: 'assigned',
            driverId: route.driver_id,
            assignedAt: new Date(),
            estimatedPickupTime: new Date(Date.now() + stop.estimated_travel_time_minutes * 60000),
            optimizedRoute: {
              stopNumber: stop.stop_number,
              totalStops: route.route_summary.total_stops,
              navigationUrl: stop.navigation_url
            }
          })
        );
      });
    });
    
    await Promise.all(updates);
    console.log(`✅ Updated ${updates.length} report assignments`);
    
  } catch (error) {
    console.error('❌ Failed to update report assignments:', error);
    throw error;
  }
};
