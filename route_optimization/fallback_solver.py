"""
Fallback route solver that doesn't require OR-Tools.
Uses simple heuristics for route optimization when OR-Tools is unavailable.
"""

from typing import List, Dict, Tuple
from .models import PickupPoint, Driver, RouteStop, PriorityFlag
from .distance_calculator import DistanceCalculator


class FallbackRouteSolver:
    """Simple route solver using heuristic algorithms (no OR-Tools dependency)."""
    
    def __init__(self, distance_calculator: DistanceCalculator):
        """
        Initialize fallback route solver.
        
        Args:
            distance_calculator: Distance calculation utility
        """
        self.distance_calculator = distance_calculator
    
    def solve_cluster_route(self, 
                           pickup_points: List[PickupPoint], 
                           driver: Driver,
                           priority_weight: float = 0.4,
                           distance_weight: float = 0.6) -> List[RouteStop]:
        """
        Solve route using simple heuristics.
        
        Args:
            pickup_points: List of pickup points in the cluster
            driver: Driver assigned to this cluster
            priority_weight: Weight for priority optimization (0-1)
            distance_weight: Weight for distance optimization (0-1)
            
        Returns:
            Ordered list of route stops
        """
        if not pickup_points:
            return []
        
        if len(pickup_points) == 1:
            # Single point - simple case
            distance = self.distance_calculator.road_distance(
                driver.base_lat, driver.base_lng,
                pickup_points[0].lat, pickup_points[0].lng
            )
            return [RouteStop(
                pickup_point=pickup_points[0],
                order=0,
                distance_from_previous=distance,
                estimated_time=self.distance_calculator.estimate_travel_time(distance)
            )]
        
        # Sort by priority first, then optimize within priority groups
        priority_sorted_points = self._sort_by_priority(pickup_points)
        
        # Use nearest neighbor heuristic within priority groups
        optimized_order = self._nearest_neighbor_route(priority_sorted_points, driver)
        
        # Convert to RouteStop objects
        return self._create_route_stops(optimized_order, driver)
    
    def _sort_by_priority(self, pickup_points: List[PickupPoint]) -> List[PickupPoint]:
        """
        Sort pickup points by priority (red > yellow > green).
        Within same priority, sort by volume (larger first).
        """
        # Group by priority
        red_points = [p for p in pickup_points if p.priority_flag == PriorityFlag.RED]
        yellow_points = [p for p in pickup_points if p.priority_flag == PriorityFlag.YELLOW]
        green_points = [p for p in pickup_points if p.priority_flag == PriorityFlag.GREEN]
        
        # Sort each group by volume (descending)
        red_points.sort(key=lambda p: p.volume, reverse=True)
        yellow_points.sort(key=lambda p: p.volume, reverse=True)
        green_points.sort(key=lambda p: p.volume, reverse=True)
        
        # Combine in priority order
        return red_points + yellow_points + green_points
    
    def _nearest_neighbor_route(self, 
                               pickup_points: List[PickupPoint], 
                               driver: Driver) -> List[PickupPoint]:
        """
        Optimize route order using nearest neighbor heuristic while respecting priority order.
        """
        if len(pickup_points) <= 2:
            return pickup_points
        
        # Group by priority to maintain priority ordering
        priority_groups = self._group_by_priority(pickup_points)
        optimized_route = []
        
        current_lat, current_lng = driver.base_lat, driver.base_lng
        
        # Process each priority group in order
        for priority in [PriorityFlag.RED, PriorityFlag.YELLOW, PriorityFlag.GREEN]:
            if priority not in priority_groups:
                continue
                
            group_points = priority_groups[priority][:]  # Make a copy
            
            # Find nearest point in this priority group
            while group_points:
                min_distance = float('inf')
                nearest_point = group_points[0]
                
                for point in group_points:
                    distance = self.distance_calculator.haversine_distance(
                        current_lat, current_lng, point.lat, point.lng
                    )
                    if distance < min_distance:
                        min_distance = distance
                        nearest_point = point
                
                optimized_route.append(nearest_point)
                group_points.remove(nearest_point)
                current_lat, current_lng = nearest_point.lat, nearest_point.lng
        
        return optimized_route
    
    def _group_by_priority(self, pickup_points: List[PickupPoint]) -> Dict[PriorityFlag, List[PickupPoint]]:
        """Group pickup points by priority level."""
        groups = {}
        for point in pickup_points:
            if point.priority_flag not in groups:
                groups[point.priority_flag] = []
            groups[point.priority_flag].append(point)
        return groups
    
    def _create_route_stops(self, 
                           pickup_points: List[PickupPoint], 
                           driver: Driver) -> List[RouteStop]:
        """
        Create RouteStop objects from ordered pickup points.
        """
        if not pickup_points:
            return []
        
        route_stops = []
        prev_lat, prev_lng = driver.base_lat, driver.base_lng
        
        for order, point in enumerate(pickup_points):
            # Calculate distance from previous location
            distance = self.distance_calculator.road_distance(
                prev_lat, prev_lng, point.lat, point.lng
            )
            
            # Estimate travel time
            travel_time = self.distance_calculator.estimate_travel_time(distance)
            
            route_stop = RouteStop(
                pickup_point=point,
                order=order,
                distance_from_previous=distance,
                estimated_time=travel_time
            )
            
            route_stops.append(route_stop)
            prev_lat, prev_lng = point.lat, point.lng
        
        return route_stops
    
    def calculate_route_metrics(self, route_stops: List[RouteStop]) -> Dict[str, float]:
        """
        Calculate performance metrics for a route.
        """
        if not route_stops:
            return {
                'total_distance': 0.0,
                'total_time': 0.0,
                'total_volume': 0.0,
                'red_stops': 0,
                'yellow_stops': 0,
                'green_stops': 0,
                'efficiency_score': 0.0
            }
        
        total_distance = sum(stop.distance_from_previous for stop in route_stops)
        total_time = sum(stop.estimated_time for stop in route_stops)
        total_volume = sum(stop.pickup_point.volume for stop in route_stops)
        
        # Count priority stops
        red_stops = sum(1 for stop in route_stops 
                       if stop.pickup_point.priority_flag == PriorityFlag.RED)
        yellow_stops = sum(1 for stop in route_stops 
                          if stop.pickup_point.priority_flag == PriorityFlag.YELLOW)
        green_stops = sum(1 for stop in route_stops 
                         if stop.pickup_point.priority_flag == PriorityFlag.GREEN)
        
        # Calculate efficiency score (simplified version)
        if len(route_stops) > 1:
            # Compare to worst-case scenario (visiting furthest point first)
            distances = [stop.distance_from_previous for stop in route_stops]
            efficiency_score = min(1.0, min(distances) / max(max(distances), 0.1))
        else:
            efficiency_score = 1.0
        
        return {
            'total_distance': total_distance,
            'total_time': total_time,
            'total_volume': total_volume,
            'red_stops': red_stops,
            'yellow_stops': yellow_stops,
            'green_stops': green_stops,
            'efficiency_score': efficiency_score
        }
