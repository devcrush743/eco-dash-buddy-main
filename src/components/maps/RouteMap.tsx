import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, Route, Eye, EyeOff, ExternalLink } from 'lucide-react';
import maptilersdk, { MAPTILER_API_KEY, DEFAULT_MAP_CONFIG } from '@/config/maptiler';

interface RouteStop {
  pickup_id: string;
  location: {
    lat: number;
    lng: number;
  };
  priority: 'red' | 'yellow' | 'green';
  volume_m3: number;
  description?: string;
  stop_number: number;
}

interface OptimizedRoute {
  driver_id: string;
  driver_name: string;
  base_location: {
    lat: number;
    lng: number;
  };
  route_summary: {
    total_distance_km: number;
    estimated_time_minutes: number;
    total_stops: number;
  };
  stops: RouteStop[];
  priority_breakdown: {
    red_stops: number;
    yellow_stops: number;
    green_stops: number;
  };
}

interface RouteMapProps {
  optimizedRoutes: any; // The actual optimization result structure
  driverId?: string;
  className?: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ optimizedRoutes, driverId, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<OptimizedRoute | null>(null);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);

  // Priority colors
  const priorityColors = {
    red: '#ef4444',
    yellow: '#f59e0b', 
    green: '#10b981'
  };

  // Initialize MapTiler map
  useEffect(() => {
    if (!mapRef.current || isMapLoaded) return;

    const initializeMap = () => {
      try {
        const map = new maptilersdk.Map({
          container: mapRef.current,
          style: maptilersdk.MapStyle.STREETS,
          center: [DEFAULT_MAP_CONFIG.center[0], DEFAULT_MAP_CONFIG.center[1]], // [lng, lat]
          zoom: DEFAULT_MAP_CONFIG.zoom,
          apiKey: MAPTILER_API_KEY
        });

        mapInstanceRef.current = map;
        setIsMapLoaded(true);

        // Add map load event
        map.on('load', () => {
          console.log('🗺️ MapTiler map loaded successfully');
        });

      } catch (error) {
        console.error('❌ Failed to initialize MapTiler map:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [isMapLoaded]);

  // Update map when routes change
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !optimizedRoutes) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.route-marker');
    existingMarkers.forEach(marker => marker.remove());

    const bounds = new maptilersdk.LngLatBounds();
    let routeCount = 0;

    // Handle the actual data structure from optimization
    const driverRoutes = optimizedRoutes.driver_routes || {};
    const routesArray = Object.values(driverRoutes);

    routesArray.forEach((route: any, routeIndex) => {
      // Filter routes if showing specific driver
      if (driverId && route.driver_id !== driverId) return;
      if (!showAllRoutes && selectedRoute && route.driver_id !== selectedRoute.driver_id) return;

      const routeStops = route.stops || [];
      if (routeStops.length === 0) return;

      // Add markers for each stop
      routeStops.forEach((stop: any, stopIndex: number) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'route-marker';
        markerElement.style.cssText = `
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: ${priorityColors[stop.priority]};
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          position: relative;
        `;
        markerElement.textContent = (stopIndex + 1).toString();

        // Add click event
        markerElement.addEventListener('click', () => {
          setSelectedStop(stop);
        });

        const marker = new maptilersdk.Marker({
          element: markerElement
        })
        .setLngLat([stop.location.lng, stop.location.lat])
        .addTo(mapInstanceRef.current);

        bounds.extend([stop.location.lng, stop.location.lat]);
      });

      // Add route line if multiple stops
      if (routeStops.length > 1) {
        const coordinates = routeStops.map((stop: any) => [stop.location.lng, stop.location.lat]);
        
        // Create a simple line source and layer
        const sourceId = `route-${routeIndex}`;
        const layerId = `route-line-${routeIndex}`;

        if (mapInstanceRef.current.getSource(sourceId)) {
          mapInstanceRef.current.removeLayer(layerId);
          mapInstanceRef.current.removeSource(sourceId);
        }

        mapInstanceRef.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        });

        mapInstanceRef.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': `hsl(${routeIndex * 60}, 70%, 50%)`,
            'line-width': 4,
            'line-opacity': 0.8
          }
        });
      }

      routeCount++;
    });

    // Fit map to show all markers
    if (routeCount > 0 && bounds.isEmpty() === false) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [isMapLoaded, optimizedRoutes, driverId, showAllRoutes, selectedRoute]);

  const formatDistance = (distance: number) => {
    return distance < 1000 ? `${distance.toFixed(0)}m` : `${(distance / 1000).toFixed(1)}km`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(0)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (!optimizedRoutes || !optimizedRoutes.driver_routes || Object.keys(optimizedRoutes.driver_routes).length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Route className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No Routes to Display</h3>
          <p className="text-sm">Optimize routes first to see them on the map</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Route Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Route Visualization</h3>
              <p className="text-sm text-gray-600">
                {Object.keys(optimizedRoutes.driver_routes).length} optimized route{Object.keys(optimizedRoutes.driver_routes).length !== 1 ? 's' : ''} ready
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAllRoutes(!showAllRoutes)}
              variant={showAllRoutes ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {showAllRoutes ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showAllRoutes ? 'Show All' : 'Filter'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Route Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(optimizedRoutes.driver_routes).map(([driverId, route]: [string, any], index) => (
          <Card 
            key={driverId} 
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedRoute?.driver_id === driverId ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedRoute(route)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-sm">{route.driver_name}</h4>
                <p className="text-xs text-gray-500">Driver ID: {driverId}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Route {index + 1}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Stops:</span>
                <span className="font-medium">{route.route_summary.total_stops}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{formatDistance(route.route_summary.total_distance_km * 1000)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{formatTime(route.route_summary.estimated_time_minutes)}</span>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs">{route.priority_breakdown.red_stops}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">{route.priority_breakdown.yellow_stops}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs">{route.priority_breakdown.green_stops}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Map Container */}
      <Card className="p-4">
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Interactive Route Map</h3>
          <p className="text-sm text-gray-600">
            Click on markers to see stop details. Routes are color-coded by driver.
          </p>
        </div>
        
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border border-gray-200"
          style={{ minHeight: '400px' }}
        />
        
        {/* Map Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Legend</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>High Priority (Red)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Medium Priority (Yellow)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Low Priority (Green)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500"></div>
              <span>Route Path</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stop Details Popup */}
      {selectedStop && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg mb-2">Stop Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">ID:</span> {selectedStop.pickup_id}</p>
                <p><span className="font-medium">Priority:</span> 
                  <span 
                    className="ml-2 px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: priorityColors[selectedStop.priority] }}
                  >
                    {selectedStop.priority.toUpperCase()}
                  </span>
                </p>
                <p><span className="font-medium">Volume:</span> {selectedStop.volume_m3} m³</p>
                <p><span className="font-medium">Location:</span> {selectedStop.location.lat.toFixed(4)}, {selectedStop.location.lng.toFixed(4)}</p>
                {selectedStop.description && (
                  <p><span className="font-medium">Description:</span> {selectedStop.description}</p>
                )}
              </div>
            </div>
            <Button
              onClick={() => setSelectedStop(null)}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RouteMap;