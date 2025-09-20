"""
Distance calculation utilities for route optimization.
Provides both Haversine (great circle) and road distance calculations.
"""

import math
import requests
from typing import List, Tuple, Optional, Dict
import time
from functools import lru_cache


class DistanceCalculator:
    """Handles distance calculations between geographic points."""
    
    def __init__(self, google_maps_api_key: Optional[str] = None):
        """
        Initialize distance calculator.
        
        Args:
            google_maps_api_key: Optional API key for Google Maps Distance Matrix API
        """
        self.google_maps_api_key = google_maps_api_key
        self._cache: Dict[Tuple[float, float, float, float], float] = {}
    
    @staticmethod
    @lru_cache(maxsize=10000)
    def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """
        Calculate the great circle distance between two points on Earth.
        
        Args:
            lat1, lng1: Latitude and longitude of first point
            lat2, lng2: Latitude and longitude of second point
            
        Returns:
            Distance in kilometers
        """
        # Convert latitude and longitude from degrees to radians
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of Earth in kilometers
        r = 6371
        
        return c * r
    
    def road_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """
        Calculate road distance using Google Maps Distance Matrix API.
        Falls back to Haversine if API is unavailable.
        
        Args:
            lat1, lng1: Latitude and longitude of first point
            lat2, lng2: Latitude and longitude of second point
            
        Returns:
            Distance in kilometers
        """
        # Check cache first
        cache_key = (lat1, lng1, lat2, lng2)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        if not self.google_maps_api_key:
            # Fallback to Haversine distance with road factor
            distance = self.haversine_distance(lat1, lng1, lat2, lng2) * 1.3  # Road factor
            self._cache[cache_key] = distance
            return distance
        
        try:
            # Google Maps Distance Matrix API call
            url = "https://maps.googleapis.com/maps/api/distancematrix/json"
            params = {
                'origins': f"{lat1},{lng1}",
                'destinations': f"{lat2},{lng2}",
                'units': 'metric',
                'mode': 'driving',
                'key': self.google_maps_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if (data['status'] == 'OK' and 
                data['rows'][0]['elements'][0]['status'] == 'OK'):
                
                # Extract distance in kilometers
                distance_meters = data['rows'][0]['elements'][0]['distance']['value']
                distance = distance_meters / 1000.0
                
                self._cache[cache_key] = distance
                return distance
            
        except (requests.RequestException, KeyError, ValueError) as e:
            print(f"Google Maps API error: {e}. Falling back to Haversine.")
        
        # Fallback to Haversine with road factor
        distance = self.haversine_distance(lat1, lng1, lat2, lng2) * 1.3
        self._cache[cache_key] = distance
        return distance
    
    def batch_distances(self, 
                       origins: List[Tuple[float, float]], 
                       destinations: List[Tuple[float, float]]) -> List[List[float]]:
        """
        Calculate distances between multiple origins and destinations.
        
        Args:
            origins: List of (lat, lng) tuples for origin points
            destinations: List of (lat, lng) tuples for destination points
            
        Returns:
            2D matrix where result[i][j] is distance from origins[i] to destinations[j]
        """
        if not self.google_maps_api_key or len(origins) * len(destinations) > 100:
            # Use Haversine for large batches or when no API key
            return self._batch_haversine(origins, destinations)
        
        try:
            return self._batch_google_maps(origins, destinations)
        except Exception as e:
            print(f"Batch Google Maps API error: {e}. Falling back to Haversine.")
            return self._batch_haversine(origins, destinations)
    
    def _batch_haversine(self, 
                        origins: List[Tuple[float, float]], 
                        destinations: List[Tuple[float, float]]) -> List[List[float]]:
        """Calculate batch distances using Haversine formula."""
        result = []
        for origin_lat, origin_lng in origins:
            row = []
            for dest_lat, dest_lng in destinations:
                distance = self.haversine_distance(origin_lat, origin_lng, dest_lat, dest_lng) * 1.3
                row.append(distance)
            result.append(row)
        return result
    
    def _batch_google_maps(self, 
                          origins: List[Tuple[float, float]], 
                          destinations: List[Tuple[float, float]]) -> List[List[float]]:
        """Calculate batch distances using Google Maps Distance Matrix API."""
        # Format origins and destinations for API
        origins_str = "|".join([f"{lat},{lng}" for lat, lng in origins])
        destinations_str = "|".join([f"{lat},{lng}" for lat, lng in destinations])
        
        url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        params = {
            'origins': origins_str,
            'destinations': destinations_str,
            'units': 'metric',
            'mode': 'driving',
            'key': self.google_maps_api_key
        }
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if data['status'] != 'OK':
            raise ValueError(f"Google Maps API returned status: {data['status']}")
        
        # Parse response into distance matrix
        result = []
        for i, row in enumerate(data['rows']):
            distance_row = []
            for j, element in enumerate(row['elements']):
                if element['status'] == 'OK':
                    distance_meters = element['distance']['value']
                    distance = distance_meters / 1000.0
                else:
                    # Fallback to Haversine for failed elements
                    origin_lat, origin_lng = origins[i]
                    dest_lat, dest_lng = destinations[j]
                    distance = self.haversine_distance(origin_lat, origin_lng, dest_lat, dest_lng) * 1.3
                
                distance_row.append(distance)
            result.append(distance_row)
        
        return result
    
    def estimate_travel_time(self, distance_km: float, avg_speed_kmh: float = 25.0) -> float:
        """
        Estimate travel time based on distance and average speed.
        
        Args:
            distance_km: Distance in kilometers
            avg_speed_kmh: Average speed in km/h (default 25 km/h for city driving)
            
        Returns:
            Travel time in minutes
        """
        return (distance_km / avg_speed_kmh) * 60.0
