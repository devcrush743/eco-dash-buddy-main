import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Map, Marker, Popup } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { DEFAULT_MAP_CONFIG, REPORT_COLORS } from '@/config/maptiler';

export interface MapRef {
  map: Map | null;
  addMarker: (coords: [number, number], options?: MarkerOptions) => Marker;
  removeMarker: (marker: Marker) => void;
  clearAllMarkers: () => void;
  flyTo: (coords: [number, number], zoom?: number) => void;
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
}

export interface MarkerOptions {
  color?: string;
  popup?: string | HTMLElement;
  className?: string;
  onClick?: () => void;
}

interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  style?: string;
  className?: string;
  onMapLoad?: (map: Map) => void;
  onClick?: (coords: [number, number]) => void;
}

export const BaseMap = forwardRef<MapRef, BaseMapProps>(({
  center = DEFAULT_MAP_CONFIG.center as [number, number],
  zoom = DEFAULT_MAP_CONFIG.zoom,
  style = DEFAULT_MAP_CONFIG.style,
  className = "w-full h-full",
  onMapLoad,
  onClick
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useImperativeHandle(ref, () => ({
    map: mapRef.current,
    addMarker: (coords: [number, number], options: MarkerOptions = {}) => {
      if (!mapRef.current) throw new Error('Map not initialized');
      
      const markerOptions: any = {
        color: options.color || REPORT_COLORS.open
      };
      
      if (options.className && options.className.trim()) {
        markerOptions.className = options.className;
      }
      
      const marker = new Marker(markerOptions)
        .setLngLat(coords)
        .addTo(mapRef.current);

      if (options.popup) {
        const popup = new Popup().setHTML(
          typeof options.popup === 'string' ? options.popup : options.popup.outerHTML
        );
        marker.setPopup(popup);
      }

      if (options.onClick) {
        marker.getElement().addEventListener('click', options.onClick);
      }

      markersRef.current.push(marker);
      return marker;
    },
    removeMarker: (marker: Marker) => {
      marker.remove();
      markersRef.current = markersRef.current.filter(m => m !== marker);
    },
    clearAllMarkers: () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    },
    flyTo: (coords: [number, number], zoomLevel = 15) => {
      mapRef.current?.flyTo({
        center: coords,
        zoom: zoomLevel,
        duration: 1000
      });
    },
    fitBounds: (bounds: [[number, number], [number, number]]) => {
      mapRef.current?.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  }));

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const map = new Map({
      container: mapContainer.current,
      style: style,
      center: center,
      zoom: zoom,
      attributionControl: true,
    });

    mapRef.current = map;

    map.on('load', () => {
      onMapLoad?.(map);
    });

    // Handle map clicks
    if (onClick) {
      map.on('click', (e) => {
        const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        onClick(coords);
      });
    }

    // Cleanup
    return () => {
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Remove map
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter(center);
    }
  }, [center]);

  // Update zoom when prop changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setZoom(zoom);
    }
  }, [zoom]);

  return (
    <div 
      ref={mapContainer} 
      className={className}
      style={{ minHeight: '300px' }}
    />
  );
});

BaseMap.displayName = 'BaseMap';
