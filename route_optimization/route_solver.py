"""
Route optimization solver using Google OR-Tools.
Implements Vehicle Routing Problem (VRP) with priority constraints.
Falls back to heuristic solver if OR-Tools is unavailable.
"""

import numpy as np
from typing import List, Dict, Optional, Tuple

from .models import PickupPoint, Driver, RouteStop, PriorityFlag
from .distance_calculator import DistanceCalculator

# Try to import OR-Tools, fall back to heuristic solver if unavailable
ORTOOLS_AVAILABLE = False
try:
    # Test OR-Tools import with a simple operation to check for segfaults
    from ortools.constraint_solver import routing_enums_pb2
    from ortools.constraint_solver import pywrapcp
    
    # Test if OR-Tools actually works (catches segfault issues)
    try:
        test_manager = pywrapcp.RoutingIndexManager(2, 1, 0)
        test_routing = pywrapcp.RoutingModel(test_manager)
        ORTOOLS_AVAILABLE = True
    except:
        ORTOOLS_AVAILABLE = False
        print("⚠️  OR-Tools has runtime issues, using fallback heuristic solver")
        
except ImportError:
    ORTOOLS_AVAILABLE = False
    print("⚠️  OR-Tools not available, using fallback heuristic solver")

# Always import fallback solver as backup
from .fallback_solver import FallbackRouteSolver


class RouteSolver:
    """Solves Vehicle Routing Problem with priority and capacity constraints."""
    
    def __init__(self, distance_calculator: DistanceCalculator):
        """
        Initialize route solver.
        
        Args:
            distance_calculator: Distance calculation utility
        """
        self.distance_calculator = distance_calculator
        
        # Always initialize fallback solver as backup
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
        # Use fallback solver if OR-Tools is not available
        if not ORTOOLS_AVAILABLE:
            return self.fallback_solver.solve_cluster_route(
                pickup_points, driver, priority_weight, distance_weight
            )
        
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
        
        # Sort points by priority first, then optimize within priority groups
        priority_sorted_points = self._sort_by_priority(pickup_points)
        
        try:
            # Create VRP model
            route_indices = self._solve_vrp(priority_sorted_points, driver, distance_weight)
            
            # Convert indices to RouteStop objects
            return self._create_route_stops(priority_sorted_points, route_indices, driver)
        except Exception as e:
            print(f"⚠️  OR-Tools solver failed: {e}. Using fallback solver.")
            # Fall back to heuristic solver
            fallback_solver = FallbackRouteSolver(self.distance_calculator)
            return fallback_solver.solve_cluster_route(
                pickup_points, driver, priority_weight, distance_weight
            )
    
    def _sort_by_priority(self, pickup_points: List[PickupPoint]) -> List[PickupPoint]:
        """
        Sort pickup points by priority (red > yellow > green).
        Within same priority, maintain geographic clustering.
        
        Args:
            pickup_points: List of pickup points to sort
            
        Returns:
            Priority-sorted list of pickup points
        """
        # Group by priority
        red_points = [p for p in pickup_points if p.priority_flag == PriorityFlag.RED]
        yellow_points = [p for p in pickup_points if p.priority_flag == PriorityFlag.YELLOW]
        green_points = [p for p in pickup_points if p.priority_flag == PriorityFlag.GREEN]
        
        # Sort each group geographically to maintain spatial coherence
        red_points = self._sort_geographically(red_points)
        yellow_points = self._sort_geographically(yellow_points)
        green_points = self._sort_geographically(green_points)
        
        # Combine in priority order
        return red_points + yellow_points + green_points
    
    def _sort_geographically(self, points: List[PickupPoint]) -> List[PickupPoint]:
        """
        Sort points geographically using nearest neighbor heuristic.
        
        Args:
            points: List of pickup points to sort
            
        Returns:
            Geographically sorted points
        """
        if len(points) <= 1:
            return points
        
        # Start from centroid point
        centroid_lat = sum(p.lat for p in points) / len(points)
        centroid_lng = sum(p.lng for p in points) / len(points)
        
        # Find nearest point to centroid as starting point
        min_distance = float('inf')
        start_point = points[0]
        for point in points:
            distance = self.distance_calculator.haversine_distance(
                centroid_lat, centroid_lng, point.lat, point.lng
            )
            if distance < min_distance:
                min_distance = distance
                start_point = point
        
        # Nearest neighbor traversal
        sorted_points = [start_point]
        remaining_points = [p for p in points if p.pickup_id != start_point.pickup_id]
        
        current_point = start_point
        while remaining_points:
            min_distance = float('inf')
            nearest_point = remaining_points[0]
            
            for point in remaining_points:
                distance = self.distance_calculator.haversine_distance(
                    current_point.lat, current_point.lng, point.lat, point.lng
                )
                if distance < min_distance:
                    min_distance = distance
                    nearest_point = point
            
            sorted_points.append(nearest_point)
            remaining_points.remove(nearest_point)
            current_point = nearest_point
        
        return sorted_points
    
    def _solve_vrp(self, 
                   pickup_points: List[PickupPoint], 
                   driver: Driver,
                   distance_weight: float) -> List[int]:
        """
        Solve VRP using OR-Tools.
        
        Args:
            pickup_points: Priority-sorted pickup points
            driver: Driver for this route
            distance_weight: Weight for distance optimization
            
        Returns:
            List of point indices in optimal order
        """
        if not ORTOOLS_AVAILABLE:
            # Should not reach here, but fallback to simple ordering
            return list(range(len(pickup_points)))
        
        # Create distance matrix (including depot)
        locations = [(driver.base_lat, driver.base_lng)]  # Depot at index 0
        for point in pickup_points:
            locations.append((point.lat, point.lng))
        
        distance_matrix = self._create_distance_matrix(locations)
        
        # Create VRP model
        manager = pywrapcp.RoutingIndexManager(
            len(distance_matrix),  # Number of locations
            1,  # Number of vehicles (single driver)
            0   # Depot index
        )
        
        routing = pywrapcp.RoutingModel(manager)
        
        # Define distance callback
        def distance_callback(from_index, to_index):
            """Returns the distance between the two nodes."""
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(distance_matrix[from_node][to_node] * 1000)  # Convert to meters
        
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Add capacity constraint
        def demand_callback(from_index):
            """Returns the demand of the node."""
            from_node = manager.IndexToNode(from_index)
            if from_node == 0:  # Depot has no demand
                return 0
            point_index = from_node - 1  # Adjust for depot
            return int(pickup_points[point_index].volume * 100)  # Convert to units
        
        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,  # null capacity slack
            [int(driver.max_capacity * 100)],  # vehicle maximum capacities
            True,  # start cumul to zero
            'Capacity'
        )
        
        # Add priority constraints by setting penalties for skipping high-priority nodes
        for i, point in enumerate(pickup_points):
            node_index = i + 1  # Adjust for depot
            penalty = self._calculate_skip_penalty(point)
            routing.AddDisjunction([manager.NodeToIndex(node_index)], penalty)
        
        # Set search parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.FromSeconds(30)  # 30 second time limit
        
        # Solve the problem
        solution = routing.SolveWithParameters(search_parameters)
        
        if solution:
            return self._extract_route_from_solution(manager, routing, solution)
        else:
            # Fallback: return points in input order
            print("VRP solver failed, using fallback ordering")
            return list(range(len(pickup_points)))
    
    def _create_distance_matrix(self, locations: List[Tuple[float, float]]) -> List[List[float]]:
        """
        Create distance matrix for all locations.
        
        Args:
            locations: List of (lat, lng) tuples
            
        Returns:
            Distance matrix
        """
        n = len(locations)
        matrix = [[0.0] * n for _ in range(n)]
        
        # Calculate distances using batch processing where possible
        try:
            batch_matrix = self.distance_calculator.batch_distances(locations, locations)
            return batch_matrix
        except Exception:
            # Fallback to individual calculations
            for i in range(n):
                for j in range(n):
                    if i != j:
                        lat1, lng1 = locations[i]
                        lat2, lng2 = locations[j]
                        matrix[i][j] = self.distance_calculator.road_distance(lat1, lng1, lat2, lng2)
            return matrix
    
    def _calculate_skip_penalty(self, point: PickupPoint) -> int:
        """
        Calculate penalty for skipping a pickup point.
        Higher penalty for higher priority points.
        
        Args:
            point: Pickup point
            
        Returns:
            Penalty value for skipping this point
        """
        base_penalty = 1000000  # High base penalty
        
        priority_multipliers = {
            PriorityFlag.RED: 10.0,
            PriorityFlag.YELLOW: 5.0,
            PriorityFlag.GREEN: 1.0
        }
        
        return int(base_penalty * priority_multipliers[point.priority_flag])
    
    def _extract_route_from_solution(self, 
                                   manager,  # pywrapcp.RoutingIndexManager when available
                                   routing,  # pywrapcp.RoutingModel when available
                                   solution) -> List[int]:
        """
        Extract route order from OR-Tools solution.
        
        Args:
            manager: Routing index manager
            routing: Routing model
            solution: Solved solution
            
        Returns:
            List of pickup point indices in route order
        """
        route = []
        index = routing.Start(0)  # Start of route for vehicle 0
        
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node != 0:  # Skip depot
                route.append(node - 1)  # Adjust for depot offset
            index = solution.Value(routing.NextVar(index))
        
        return route
    
    def _create_route_stops(self, 
                           pickup_points: List[PickupPoint], 
                           route_indices: List[int],
                           driver: Driver) -> List[RouteStop]:
        """
        Create RouteStop objects from optimized route.
        
        Args:
            pickup_points: List of all pickup points
            route_indices: Optimized order of point indices
            driver: Driver for this route
            
        Returns:
            List of RouteStop objects
        """
        if not route_indices:
            return []
        
        route_stops = []
        prev_lat, prev_lng = driver.base_lat, driver.base_lng
        
        for order, point_index in enumerate(route_indices):
            if point_index >= len(pickup_points):
                continue  # Skip invalid indices
                
            point = pickup_points[point_index]
            
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
        
        Args:
            route_stops: List of route stops
            
        Returns:
            Dictionary with route metrics
        """
        # Use fallback solver if OR-Tools is not available or as backup
        if not ORTOOLS_AVAILABLE:
            return self.fallback_solver.calculate_route_metrics(route_stops)
        
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
        
        # Calculate efficiency score (compared to straight-line distance)
        if len(route_stops) > 1:
            first_point = route_stops[0].pickup_point
            last_point = route_stops[-1].pickup_point
            straight_line_distance = self.distance_calculator.haversine_distance(
                first_point.lat, first_point.lng,
                last_point.lat, last_point.lng
            )
            efficiency_score = min(1.0, straight_line_distance / max(total_distance, 0.1))
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
