"""
Main route optimization engine that orchestrates clustering, routing, and optimization.
This is the primary interface for the route optimization module.
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
import statistics

from .models import (
    PickupPoint, Driver, RouteStop, OptimizedRoute, 
    OptimizationResult, PriorityFlag
)
from .distance_calculator import DistanceCalculator
from .clustering import PickupClusterer
from .simple_route_solver import SimpleRouteSolver


class RouteOptimizer:
    """
    Main route optimization engine.
    Orchestrates clustering, route solving, and optimization.
    """
    
    def __init__(self, google_maps_api_key: Optional[str] = None):
        """
        Initialize route optimizer.
        
        Args:
            google_maps_api_key: Optional Google Maps API key for accurate distances
        """
        self.distance_calculator = DistanceCalculator(google_maps_api_key)
        self.clusterer = PickupClusterer(self.distance_calculator)
        self.route_solver = SimpleRouteSolver(self.distance_calculator)
    
    def optimize_routes(self,
                       pickup_points: List[PickupPoint],
                       drivers: List[Driver],
                       priority_weight: float = 0.4,
                       distance_weight: float = 0.4,
                       balance_weight: float = 0.2) -> OptimizationResult:
        """
        Optimize routes for all drivers and pickup points.
        
        Args:
            pickup_points: List of pickup points to collect
            drivers: List of available drivers
            priority_weight: Weight for priority coverage (0-1)
            distance_weight: Weight for path efficiency (0-1)
            balance_weight: Weight for workload balance (0-1)
            
        Returns:
            Complete optimization result
        """
        # Validate inputs
        self._validate_inputs(pickup_points, drivers, priority_weight, distance_weight, balance_weight)
        
        if not pickup_points or not drivers:
            return self._create_empty_result(priority_weight, distance_weight, balance_weight)
        
        print(f"🚛 Optimizing routes for {len(drivers)} drivers and {len(pickup_points)} pickup points")
        
        # Step 1: Cluster pickup points based on density and driver capacity
        print("📍 Step 1: Clustering pickup points...")
        clustered_points = self.clusterer.cluster_pickups(
            pickup_points, drivers, balance_workload=True
        )
        
        # Analyze clustering balance
        cluster_balance = self.clusterer.analyze_cluster_balance(clustered_points)
        print(f"   ✅ Created {len(clustered_points)} clusters with balance score: {cluster_balance['balance_score']:.3f}")
        
        # Step 2: Solve routes for each cluster
        print("🗺️  Step 2: Solving optimal routes...")
        optimized_routes = []
        
        for cluster_id, cluster_points in clustered_points.items():
            if cluster_id >= len(drivers):
                print(f"   ⚠️  Skipping cluster {cluster_id} - no driver available")
                continue
                
            driver = drivers[cluster_id]
            print(f"   🚗 Optimizing route for driver {driver.driver_id} ({len(cluster_points)} points)")
            
            # Solve route for this cluster
            route_stops = self.route_solver.solve_cluster_route(
                cluster_points, driver, priority_weight, distance_weight
            )
            
            # Create optimized route object
            optimized_route = self._create_optimized_route(driver, route_stops)
            optimized_routes.append(optimized_route)
            
            print(f"      📊 Route: {optimized_route.total_distance:.1f}km, "
                  f"{optimized_route.total_stops} stops, "
                  f"{optimized_route.red_stops}R/{optimized_route.yellow_stops}Y/{optimized_route.green_stops}G")
        
        # Step 3: Calculate global metrics and create result
        print("📈 Step 3: Calculating optimization metrics...")
        result = self._create_optimization_result(
            optimized_routes, pickup_points,
            priority_weight, distance_weight, balance_weight
        )
        
        print(f"🎯 Optimization complete:")
        print(f"   📏 Total distance: {result.total_distance:.1f}km")
        print(f"   ⏱️  Total time: {result.total_time:.0f} minutes")
        print(f"   🎨 Priority coverage: {result.total_red_covered}R/{result.total_yellow_covered}Y/{result.total_green_covered}G")
        print(f"   ⚖️  Workload balance: {result.workload_balance_score:.3f}")
        
        return result
    
    def _validate_inputs(self,
                        pickup_points: List[PickupPoint],
                        drivers: List[Driver],
                        priority_weight: float,
                        distance_weight: float,
                        balance_weight: float) -> None:
        """Validate optimization inputs."""
        if not isinstance(pickup_points, list):
            raise ValueError("pickup_points must be a list")
        
        if not isinstance(drivers, list):
            raise ValueError("drivers must be a list")
        
        # Validate weights
        weights = [priority_weight, distance_weight, balance_weight]
        if not all(0 <= w <= 1 for w in weights):
            raise ValueError("All weights must be between 0 and 1")
        
        if abs(sum(weights) - 1.0) > 0.01:
            raise ValueError("Weights must sum to approximately 1.0")
        
        # Validate pickup points
        for point in pickup_points:
            if not isinstance(point, PickupPoint):
                raise ValueError("All pickup_points must be PickupPoint instances")
        
        # Validate drivers
        for driver in drivers:
            if not isinstance(driver, Driver):
                raise ValueError("All drivers must be Driver instances")
        
        # Check for duplicate IDs
        pickup_ids = [p.pickup_id for p in pickup_points]
        if len(pickup_ids) != len(set(pickup_ids)):
            raise ValueError("Duplicate pickup_ids found")
        
        driver_ids = [d.driver_id for d in drivers]
        if len(driver_ids) != len(set(driver_ids)):
            raise ValueError("Duplicate driver_ids found")
    
    def _create_empty_result(self,
                           priority_weight: float,
                           distance_weight: float,
                           balance_weight: float) -> OptimizationResult:
        """Create empty optimization result."""
        return OptimizationResult(
            routes=[],
            total_distance=0.0,
            total_time=0.0,
            total_points_covered=0,
            average_workload=0.0,
            workload_std_deviation=0.0,
            total_red_covered=0,
            total_yellow_covered=0,
            total_green_covered=0,
            priority_weight=priority_weight,
            distance_weight=distance_weight,
            balance_weight=balance_weight
        )
    
    def _create_optimized_route(self, driver: Driver, route_stops: List[RouteStop]) -> OptimizedRoute:
        """Create OptimizedRoute object from route stops."""
        if not route_stops:
            return OptimizedRoute(
                driver=driver,
                stops=[],
                total_distance=0.0,
                total_time=0.0,
                total_volume=0.0,
                red_stops=0,
                yellow_stops=0,
                green_stops=0,
                workload_score=0.0,
                efficiency_score=0.0,
                priority_score=0.0
            )
        
        # Calculate route metrics
        metrics = self.route_solver.calculate_route_metrics(route_stops)
        
        # Calculate normalized scores
        workload_score = min(1.0, metrics['total_volume'] / driver.max_capacity)
        efficiency_score = metrics['efficiency_score']
        
        # Calculate priority score (weighted by priority levels)
        total_stops = len(route_stops)
        if total_stops > 0:
            priority_score = (
                (metrics['red_stops'] * 3 + metrics['yellow_stops'] * 2 + metrics['green_stops']) / 
                (total_stops * 3)
            )
        else:
            priority_score = 0.0
        
        return OptimizedRoute(
            driver=driver,
            stops=route_stops,
            total_distance=metrics['total_distance'],
            total_time=metrics['total_time'],
            total_volume=metrics['total_volume'],
            red_stops=metrics['red_stops'],
            yellow_stops=metrics['yellow_stops'],
            green_stops=metrics['green_stops'],
            workload_score=workload_score,
            efficiency_score=efficiency_score,
            priority_score=priority_score
        )
    
    def _create_optimization_result(self,
                                  optimized_routes: List[OptimizedRoute],
                                  original_pickup_points: List[PickupPoint],
                                  priority_weight: float,
                                  distance_weight: float,
                                  balance_weight: float) -> OptimizationResult:
        """Create complete optimization result."""
        if not optimized_routes:
            return self._create_empty_result(priority_weight, distance_weight, balance_weight)
        
        # Calculate global metrics
        total_distance = sum(route.total_distance for route in optimized_routes)
        total_time = sum(route.total_time for route in optimized_routes)
        total_points_covered = sum(route.total_stops for route in optimized_routes)
        
        # Calculate priority coverage
        total_red_covered = sum(route.red_stops for route in optimized_routes)
        total_yellow_covered = sum(route.yellow_stops for route in optimized_routes)
        total_green_covered = sum(route.green_stops for route in optimized_routes)
        
        # Calculate workload statistics
        workloads = [route.total_volume for route in optimized_routes]
        average_workload = statistics.mean(workloads) if workloads else 0.0
        workload_std_deviation = statistics.stdev(workloads) if len(workloads) > 1 else 0.0
        
        return OptimizationResult(
            routes=optimized_routes,
            total_distance=total_distance,
            total_time=total_time,
            total_points_covered=total_points_covered,
            average_workload=average_workload,
            workload_std_deviation=workload_std_deviation,
            total_red_covered=total_red_covered,
            total_yellow_covered=total_yellow_covered,
            total_green_covered=total_green_covered,
            priority_weight=priority_weight,
            distance_weight=distance_weight,
            balance_weight=balance_weight
        )
    
    def analyze_optimization_quality(self, result: OptimizationResult) -> Dict[str, float]:
        """
        Analyze the quality of optimization result.
        
        Args:
            result: Optimization result to analyze
            
        Returns:
            Dictionary with quality metrics
        """
        if not result.routes:
            return {
                'overall_score': 0.0,
                'priority_coverage_score': 0.0,
                'distance_efficiency_score': 0.0,
                'workload_balance_score': 0.0,
                'capacity_utilization_score': 0.0
            }
        
        # Priority coverage score
        total_priority_value = sum(
            route.red_stops * 3 + route.yellow_stops * 2 + route.green_stops
            for route in result.routes
        )
        max_priority_value = result.total_points_covered * 3
        priority_coverage_score = total_priority_value / max(max_priority_value, 1)
        
        # Distance efficiency score (average of individual route efficiencies)
        distance_efficiency_score = statistics.mean([
            route.efficiency_score for route in result.routes
        ]) if result.routes else 0.0
        
        # Workload balance score
        workload_balance_score = result.workload_balance_score
        
        # Capacity utilization score
        capacity_utilizations = [route.capacity_utilization for route in result.routes]
        capacity_utilization_score = statistics.mean(capacity_utilizations) / 100.0 if capacity_utilizations else 0.0
        
        # Overall score (weighted combination)
        overall_score = (
            priority_coverage_score * result.priority_weight +
            distance_efficiency_score * result.distance_weight +
            workload_balance_score * result.balance_weight
        )
        
        return {
            'overall_score': overall_score,
            'priority_coverage_score': priority_coverage_score,
            'distance_efficiency_score': distance_efficiency_score,
            'workload_balance_score': workload_balance_score,
            'capacity_utilization_score': capacity_utilization_score
        }
    
    def export_routes_for_drivers(self, result: OptimizationResult) -> Dict[str, Dict]:
        """
        Export routes in a format suitable for driver mobile apps.
        
        Args:
            result: Optimization result
            
        Returns:
            Dictionary with driver routes in mobile-friendly format
        """
        export_data = {}
        
        for route in result.routes:
            driver_data = {
                'driver_id': route.driver.driver_id,
                'driver_name': route.driver.name or route.driver.driver_id,
                'base_location': {
                    'lat': route.driver.base_lat,
                    'lng': route.driver.base_lng
                },
                'route_summary': {
                    'total_stops': route.total_stops,
                    'total_distance_km': round(route.total_distance, 2),
                    'estimated_time_minutes': round(route.total_time, 0),
                    'total_volume_m3': round(route.total_volume, 2),
                    'capacity_utilization_percent': round(route.capacity_utilization, 1)
                },
                'priority_breakdown': {
                    'red_stops': route.red_stops,
                    'yellow_stops': route.yellow_stops,
                    'green_stops': route.green_stops
                },
                'stops': []
            }
            
            # Add detailed stop information
            for stop in route.stops:
                stop_data = {
                    'stop_number': stop.order + 1,
                    'pickup_id': stop.pickup_point.pickup_id,
                    'location': {
                        'lat': stop.pickup_point.lat,
                        'lng': stop.pickup_point.lng
                    },
                    'priority': stop.pickup_point.priority_flag.value,
                    'volume_m3': stop.pickup_point.volume,
                    'description': stop.pickup_point.description,
                    'distance_from_previous_km': round(stop.distance_from_previous, 2),
                    'estimated_travel_time_minutes': round(stop.estimated_time, 0),
                    'navigation_url': self._generate_navigation_url(stop.pickup_point)
                }
                driver_data['stops'].append(stop_data)
            
            export_data[route.driver.driver_id] = driver_data
        
        return export_data
    
    def _generate_navigation_url(self, pickup_point: PickupPoint) -> str:
        """Generate Google Maps navigation URL for a pickup point."""
        return f"https://www.google.com/maps/dir/?api=1&destination={pickup_point.lat},{pickup_point.lng}"
    
    def suggest_driver_assignments(self,
                                 pickup_points: List[PickupPoint],
                                 drivers: List[Driver]) -> Dict[str, List[str]]:
        """
        Suggest initial driver assignments before full optimization.
        Useful for preview or manual adjustment.
        
        Args:
            pickup_points: List of pickup points
            drivers: List of available drivers
            
        Returns:
            Dictionary mapping driver_id to list of pickup_ids
        """
        if not pickup_points or not drivers:
            return {}
        
        # Use clustering to suggest assignments
        clustered_points = self.clusterer.cluster_pickups(
            pickup_points, drivers, balance_workload=True
        )
        
        assignments = {}
        for cluster_id, cluster_points in clustered_points.items():
            if cluster_id < len(drivers):
                driver_id = drivers[cluster_id].driver_id
                pickup_ids = [point.pickup_id for point in cluster_points]
                assignments[driver_id] = pickup_ids
        
        return assignments
