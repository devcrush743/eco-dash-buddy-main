"""
Simple route solver that works without OR-Tools dependency.
This is the main route solver that uses heuristic algorithms.
"""

from typing import List, Dict
from .models import PickupPoint, Driver, RouteStop, PriorityFlag
from .distance_calculator import DistanceCalculator
from .fallback_solver import FallbackRouteSolver


class SimpleRouteSolver:
    """Route solver using heuristic algorithms (no external dependencies)."""
    
    def __init__(self, distance_calculator: DistanceCalculator):
        """
        Initialize simple route solver.
        
        Args:
            distance_calculator: Distance calculation utility
        """
        self.distance_calculator = distance_calculator
        self.fallback_solver = FallbackRouteSolver(distance_calculator)
    
    def solve_cluster_route(self, 
                           pickup_points: List[PickupPoint], 
                           driver: Driver,
                           priority_weight: float = 0.4,
                           distance_weight: float = 0.6) -> List[RouteStop]:
        """
        Solve optimal route for a single cluster assigned to one driver.
        
        Args:
            pickup_points: List of pickup points in the cluster
            driver: Driver assigned to this cluster
            priority_weight: Weight for priority optimization (0-1)
            distance_weight: Weight for distance optimization (0-1)
            
        Returns:
            Ordered list of route stops
        """
        return self.fallback_solver.solve_cluster_route(
            pickup_points, driver, priority_weight, distance_weight
        )
    
    def calculate_route_metrics(self, route_stops: List[RouteStop]) -> Dict[str, float]:
        """
        Calculate performance metrics for a route.
        
        Args:
            route_stops: List of route stops
            
        Returns:
            Dictionary with route metrics
        """
        return self.fallback_solver.calculate_route_metrics(route_stops)
