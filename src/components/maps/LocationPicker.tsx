import { useEffect, useRef, useState } from 'react';
import { BaseMap, MapRef } from './BaseMap';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentLocation } from '@/utils/imageUtils';
import { formatCoordinates } from '@/utils/geoUtils';
import { 
  MapPin, 
  Navigation, 
  Crosshair,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
  showCurrentLocationButton?: boolean;
}

export const LocationPicker = ({
  onLocationSelect,
  initialLocation,
  className = "w-full h-80",
  showCurrentLocationButton = true
}: LocationPickerProps) => {
  const mapRef = useRef<MapRef>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [markerRef, setMarkerRef] = useState<any>(null);

  // Handle map clicks to select location
  const handleMapClick = (coords: [number, number]) => {
    const location = { lat: coords[1], lng: coords[0] };
    setSelectedLocation(location);
    onLocationSelect(location);
    
    // Remove existing marker
    if (markerRef && mapRef.current) {
      mapRef.current.removeMarker(markerRef);
    }
    
    // Add new marker
    if (mapRef.current) {
      const marker = mapRef.current.addMarker(coords, {
        color: '#22C55E', // Green color
        popup: `
          <div class="p-2">
            <p class="font-semibold text-sm">📍 Selected Location</p>
            <p class="text-xs text-gray-600">${formatCoordinates(location.lat, location.lng)}</p>
          </div>
        `
      });
      setMarkerRef(marker);
    }
  };

  // Get current GPS location
  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await getCurrentLocation();
      const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
      const location = { lat: position.coords.latitude, lng: position.coords.longitude };
      
      setSelectedLocation(location);
      onLocationSelect(location);
      
      // Fly to current location
      if (mapRef.current) {
        mapRef.current.flyTo(coords, 16);
        
        // Remove existing marker
        if (markerRef) {
          mapRef.current.removeMarker(markerRef);
        }
        
        // Add current location marker
        const marker = mapRef.current.addMarker(coords, {
          color: '#3B82F6', // Blue color for current location
          popup: `
            <div class="p-2">
              <p class="font-semibold text-sm">📱 Current Location</p>
              <p class="text-xs text-gray-600">${formatCoordinates(location.lat, location.lng)}</p>
              <p class="text-xs text-blue-600 mt-1">GPS Accuracy: ±${Math.round(position.coords.accuracy)}m</p>
            </div>
          `
        });
        setMarkerRef(marker);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Add initial marker if location is provided
  useEffect(() => {
    if (initialLocation && mapRef.current) {
      const coords: [number, number] = [initialLocation.lng, initialLocation.lat];
      const marker = mapRef.current.addMarker(coords, {
        color: '#22C55E',
        popup: `
          <div class="p-2">
            <p class="font-semibold text-sm">📍 Selected Location</p>
            <p class="text-xs text-gray-600">${formatCoordinates(initialLocation.lat, initialLocation.lng)}</p>
          </div>
        `
      });
      setMarkerRef(marker);
      mapRef.current.flyTo(coords, 15);
    }
  }, [initialLocation]);

  return (
    <div className={`relative ${className}`}>
      <BaseMap
        ref={mapRef}
        onClick={handleMapClick}
        className="w-full h-full rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors"
        zoom={13}
      />
      
      {/* Crosshair indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Crosshair className="h-8 w-8 text-primary opacity-50" />
      </div>
      
      {/* Instructions */}
      <Card className="absolute top-4 left-4 right-4 p-3 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-sm font-medium">
            {selectedLocation ? 'Location Selected' : 'Click on the map to select location'}
          </p>
        </div>
        {selectedLocation && (
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs font-mono text-muted-foreground">
              {formatCoordinates(selectedLocation.lat, selectedLocation.lng)}
            </span>
          </div>
        )}
      </Card>

      {/* Current location button */}
      {showCurrentLocationButton && (
        <div className="absolute bottom-4 right-4">
          <Button
            size="sm"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">
              {isGettingLocation ? 'Getting...' : 'My Location'}
            </span>
          </Button>
        </div>
      )}

      {/* Selected location info */}
      {selectedLocation && (
        <Card className="absolute bottom-4 left-4 p-3 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Selected
            </Badge>
          </div>
          <p className="text-xs font-mono mt-1 text-muted-foreground">
            {formatCoordinates(selectedLocation.lat, selectedLocation.lng, 4)}
          </p>
        </Card>
      )}

      {/* Map instructions overlay */}
      {!selectedLocation && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
          <Card className="p-4 bg-white/90 backdrop-blur-sm max-w-sm mx-4">
            <div className="text-center space-y-2">
              <MapPin className="h-8 w-8 mx-auto text-primary" />
              <p className="text-sm font-medium">Select Report Location</p>
              <p className="text-xs text-muted-foreground">
                Tap anywhere on the map to pinpoint the exact location of the waste management issue
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
