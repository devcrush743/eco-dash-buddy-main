// Geospatial utilities for route optimization and distance calculations

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate Haversine distance between two points in meters
 */
export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Convert degrees to radians
 */
export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 */
export const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * Calculate bearing between two points in degrees
 */
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
};

/**
 * Simple nearest neighbor algorithm for route optimization
 * Fallback when OpenAI is unavailable
 */
export const nearestNeighborRoute = (
  startLocation: Coordinates,
  stops: Array<{ id: string; lat: number; lng: number; priority?: 'normal' | 'redflag' }>
): Array<{ id: string; lat: number; lng: number; sequence: number; distance: number }> => {
  const route: Array<{ id: string; lat: number; lng: number; sequence: number; distance: number }> = [];
  const unvisited = [...stops];
  let currentLocation = startLocation;
  let sequence = 1;

  // Prioritize red flag reports first
  const redFlagStops = unvisited.filter(stop => stop.priority === 'redflag');
  const normalStops = unvisited.filter(stop => stop.priority !== 'redflag');
  
  // Process red flags first, then normal reports
  const orderedStops = [...redFlagStops, ...normalStops];
  const processedIds = new Set<string>();

  while (processedIds.size < stops.length) {
    let nearestStop = null;
    let minDistance = Infinity;

    // Find nearest unvisited stop
    for (const stop of orderedStops) {
      if (processedIds.has(stop.id)) continue;

      const distance = haversineDistance(
        currentLocation.lat,
        currentLocation.lng,
        stop.lat,
        stop.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestStop = stop;
      }
    }

    if (nearestStop) {
      route.push({
        id: nearestStop.id,
        lat: nearestStop.lat,
        lng: nearestStop.lng,
        sequence,
        distance: minDistance
      });

      processedIds.add(nearestStop.id);
      currentLocation = { lat: nearestStop.lat, lng: nearestStop.lng };
      sequence++;
    } else {
      break;
    }
  }

  return route;
};

/**
 * Calculate total route distance and estimated duration
 */
export const calculateRouteMetrics = (
  startLocation: Coordinates,
  route: Array<{ lat: number; lng: number }>,
  averageSpeedKmh: number = 25 // Average city driving speed
): { totalDistanceMeters: number; estimatedDurationSec: number } => {
  let totalDistance = 0;
  let currentLocation = startLocation;

  for (const stop of route) {
    const distance = haversineDistance(
      currentLocation.lat,
      currentLocation.lng,
      stop.lat,
      stop.lng
    );
    totalDistance += distance;
    currentLocation = stop;
  }

  const estimatedDurationSec = (totalDistance / 1000) * (3600 / averageSpeedKmh);

  return {
    totalDistanceMeters: totalDistance,
    estimatedDurationSec: Math.round(estimatedDurationSec)
  };
};

/**
 * Generate simple polyline for route visualization
 * This creates a straight line between points - in production, use a routing service
 */
export const generateSimplePolyline = (
  startLocation: Coordinates,
  route: Array<{ lat: number; lng: number }>
): Coordinates[] => {
  const polyline: Coordinates[] = [startLocation];
  
  for (const stop of route) {
    polyline.push({ lat: stop.lat, lng: stop.lng });
  }
  
  return polyline;
};

/**
 * Check if coordinates are within valid ranges
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat: number, lng: number, precision: number = 6): string => {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

/**
 * Calculate center point of multiple coordinates
 */
export const calculateCenter = (coordinates: Coordinates[]): Coordinates => {
  if (coordinates.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      lat: acc.lat + coord.lat,
      lng: acc.lng + coord.lng
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length
  };
};

/**
 * Calculate bounding box for a set of coordinates
 */
export const calculateBounds = (coordinates: Coordinates[]): {
  north: number;
  south: number;
  east: number;
  west: number;
} => {
  if (coordinates.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }

  const lats = coordinates.map(c => c.lat);
  const lngs = coordinates.map(c => c.lng);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  };
};
