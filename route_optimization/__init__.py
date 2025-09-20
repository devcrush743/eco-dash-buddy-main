"""
Route Optimization Module for Swachh Saarthi Waste Management System.

This module provides comprehensive route optimization for waste collection vehicles,
balancing priority coverage, path efficiency, and workload distribution.

Key Features:
- Priority-based route optimization (red > yellow > green flags)
- K-Means clustering for balanced driver workloads
- Vehicle Routing Problem (VRP) solving with OR-Tools
- Real-time distance calculations with Google Maps integration
- Production-ready modular architecture

Usage:
    from route_optimization import RouteOptimizer, PickupPoint, Driver, PriorityFlag
    
    # Create optimizer
    optimizer = RouteOptimizer(google_maps_api_key="your_api_key")
    
    # Define pickup points
    points = [
        PickupPoint("P1", 28.6139, 77.2090, PriorityFlag.RED, 2.5),
        PickupPoint("P2", 28.6140, 77.2095, PriorityFlag.YELLOW, 1.8),
        # ... more points
    ]
    
    # Define drivers
    drivers = [
        Driver("D1", 28.6130, 77.2080, max_capacity=50.0),
        Driver("D2", 28.6150, 77.2100, max_capacity=45.0),
        # ... more drivers
    ]
    
    # Optimize routes
    result = optimizer.optimize_routes(points, drivers)
    
    # Export for mobile apps
    mobile_routes = optimizer.export_routes_for_drivers(result)

Author: Swachh Saarthi Development Team
Version: 1.0.0
"""

from .models import (
    PickupPoint,
    Driver,
    RouteStop,
    OptimizedRoute,
    OptimizationResult,
    PriorityFlag
)

from .optimizer import RouteOptimizer
from .distance_calculator import DistanceCalculator
from .clustering import PickupClusterer
from .simple_route_solver import SimpleRouteSolver

# The route solver now uses heuristic algorithms without OR-Tools dependency
print("ℹ️  Route optimization module loaded with heuristic solver")
print("   For enhanced optimization, install OR-Tools: pip install ortools")

__version__ = "1.0.0"
__all__ = [
    "RouteOptimizer",
    "PickupPoint", 
    "Driver",
    "RouteStop",
    "OptimizedRoute",
    "OptimizationResult",
    "PriorityFlag",
    "DistanceCalculator",
    "PickupClusterer", 
    "SimpleRouteSolver"
]

# Module-level convenience function
def optimize_waste_collection_routes(pickup_points_data: list,
                                   drivers_data: list,
                                   google_maps_api_key: str = None,
                                   priority_weight: float = 0.4,
                                   distance_weight: float = 0.4,
                                   balance_weight: float = 0.2) -> dict:
    """
    Convenience function for route optimization with dict inputs.
    
    Args:
        pickup_points_data: List of dicts with pickup point data
            Required keys: pickup_id, lat, lng, priority_flag, volume
            Optional keys: description
        drivers_data: List of dicts with driver data
            Required keys: driver_id, base_lat, base_lng
            Optional keys: max_capacity, name
        google_maps_api_key: Google Maps API key for accurate distances
        priority_weight: Weight for priority coverage (0-1)
        distance_weight: Weight for path efficiency (0-1)
        balance_weight: Weight for workload balance (0-1)
        
    Returns:
        Dictionary with optimized routes for mobile consumption
        
    Example:
        pickup_data = [
            {
                "pickup_id": "P1",
                "lat": 28.6139,
                "lng": 77.2090,
                "priority_flag": "red",
                "volume": 2.5,
                "description": "Market area waste"
            },
            # ... more points
        ]
        
        driver_data = [
            {
                "driver_id": "D1",
                "base_lat": 28.6130,
                "base_lng": 77.2080,
                "max_capacity": 50.0,
                "name": "Rajesh Kumar"
            },
            # ... more drivers
        ]
        
        result = optimize_waste_collection_routes(pickup_data, driver_data)
    """
    # Convert dict data to objects
    pickup_points = []
    for point_data in pickup_points_data:
        try:
            priority = PriorityFlag(point_data['priority_flag'].lower())
            point = PickupPoint(
                pickup_id=point_data['pickup_id'],
                lat=float(point_data['lat']),
                lng=float(point_data['lng']),
                priority_flag=priority,
                volume=float(point_data['volume']),
                description=point_data.get('description')
            )
            pickup_points.append(point)
        except (KeyError, ValueError) as e:
            raise ValueError(f"Invalid pickup point data: {point_data}. Error: {e}")
    
    drivers = []
    for driver_data in drivers_data:
        try:
            driver = Driver(
                driver_id=driver_data['driver_id'],
                base_lat=float(driver_data['base_lat']),
                base_lng=float(driver_data['base_lng']),
                max_capacity=float(driver_data.get('max_capacity', 50.0)),
                name=driver_data.get('name')
            )
            drivers.append(driver)
        except (KeyError, ValueError) as e:
            raise ValueError(f"Invalid driver data: {driver_data}. Error: {e}")
    
    # Run optimization
    optimizer = RouteOptimizer(google_maps_api_key)
    result = optimizer.optimize_routes(
        pickup_points, drivers,
        priority_weight, distance_weight, balance_weight
    )
    
    # Export mobile-friendly format
    mobile_routes = optimizer.export_routes_for_drivers(result)
    
    # Add global summary
    quality_metrics = optimizer.analyze_optimization_quality(result)
    
    return {
        "optimization_summary": {
            "total_drivers": len(drivers),
            "total_pickup_points": len(pickup_points),
            "total_distance_km": round(result.total_distance, 2),
            "total_time_minutes": round(result.total_time, 0),
            "points_covered": result.total_points_covered,
            "priority_coverage": {
                "red": result.total_red_covered,
                "yellow": result.total_yellow_covered,
                "green": result.total_green_covered
            },
            "quality_metrics": {
                "overall_score": round(quality_metrics['overall_score'], 3),
                "priority_coverage_score": round(quality_metrics['priority_coverage_score'], 3),
                "distance_efficiency_score": round(quality_metrics['distance_efficiency_score'], 3),
                "workload_balance_score": round(quality_metrics['workload_balance_score'], 3)
            }
        },
        "driver_routes": mobile_routes
    }
