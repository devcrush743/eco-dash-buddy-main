import * as maptilersdk from '@maptiler/sdk';

// MapTiler API Key - Get from https://cloud.maptiler.com/
// For development, you can use a demo key or create a free account
export const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || 'GGTeCG34X657wEfuxA7D';

// Initialize MapTiler SDK
maptilersdk.config.apiKey = MAPTILER_API_KEY;

// Default map configuration
export const DEFAULT_MAP_CONFIG = {
  style: maptilersdk.MapStyle.STREETS, // You can change to SATELLITE, HYBRID, etc.
  center: [77.2090, 28.6139], // Default to Delhi, India [lng, lat]
  zoom: 12,
  attributionControl: true,
  logoControl: true,
};

// Map styles available
export const MAP_STYLES = {
  STREETS: maptilersdk.MapStyle.STREETS,
  SATELLITE: maptilersdk.MapStyle.SATELLITE,
  HYBRID: maptilersdk.MapStyle.HYBRID,
  TERRAIN: maptilersdk.MapStyle.TERRAIN,
  BASIC: maptilersdk.MapStyle.BASIC,
  BRIGHT: maptilersdk.MapStyle.BRIGHT,
  DATAVIZ: maptilersdk.MapStyle.DATAVIZ,
};

// Map bounds for Ghaziabad region (adjust as needed)
export const GHAZIABAD_BOUNDS = {
  southwest: [77.3, 28.5], // [lng, lat]
  northeast: [77.5, 28.8], // [lng, lat]
};

// Color scheme for different report types
export const REPORT_COLORS = {
  open: '#3B82F6', // Blue
  assigned: '#F59E0B', // Amber
  collected: '#10B981', // Emerald
  approved: '#059669', // Green
  rejected: '#EF4444', // Red
  redflag: '#DC2626', // Dark red for urgent reports
};

export default maptilersdk;
