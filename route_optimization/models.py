"""
Data models for route optimization module.
Defines the core data structures used throughout the system.
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum


class PriorityFlag(Enum):
    """Priority levels for waste collection points."""
    RED = "red"
    YELLOW = "yellow"
    GREEN = "green"
    
    @property
    def priority_value(self) -> int:
        """Return numeric priority value (higher = more urgent)."""
        return {"red": 3, "yellow": 2, "green": 1}[self.value]


@dataclass
class PickupPoint:
    """Represents a waste collection pickup point."""
    pickup_id: str
    lat: float
    lng: float
    priority_flag: PriorityFlag
    volume: float  # Volume of waste in cubic meters
    description: Optional[str] = None
    
    def __post_init__(self):
        """Validate pickup point data."""
        if not (-90 <= self.lat <= 90):
            raise ValueError(f"Invalid latitude: {self.lat}")
        if not (-180 <= self.lng <= 180):
            raise ValueError(f"Invalid longitude: {self.lng}")
        if self.volume < 0:
            raise ValueError(f"Volume cannot be negative: {self.volume}")


@dataclass
class Driver:
    """Represents a waste collection driver."""
    driver_id: str
    base_lat: float
    base_lng: float
    max_capacity: float = 50.0  # Maximum capacity in cubic meters
    name: Optional[str] = None
    
    def __post_init__(self):
        """Validate driver data."""
        if not (-90 <= self.base_lat <= 90):
            raise ValueError(f"Invalid base latitude: {self.base_lat}")
        if not (-180 <= self.base_lng <= 180):
            raise ValueError(f"Invalid base longitude: {self.base_lng}")
        if self.max_capacity <= 0:
            raise ValueError(f"Capacity must be positive: {self.max_capacity}")


@dataclass
class RouteStop:
    """Represents a stop in an optimized route."""
    pickup_point: PickupPoint
    order: int  # Order in the route (0-based)
    distance_from_previous: float  # Distance in kilometers
    estimated_time: float  # Time in minutes


@dataclass
class OptimizedRoute:
    """Represents an optimized route for a driver."""
    driver: Driver
    stops: List[RouteStop]
    total_distance: float  # Total route distance in kilometers
    total_time: float  # Total route time in minutes
    total_volume: float  # Total waste volume
    
    # Priority breakdown
    red_stops: int
    yellow_stops: int
    green_stops: int
    
    # Performance metrics
    workload_score: float  # Normalized workload score (0-1)
    efficiency_score: float  # Distance efficiency score (0-1)
    priority_score: float  # Priority coverage score (0-1)
    
    @property
    def total_stops(self) -> int:
        """Return total number of stops."""
        return len(self.stops)
    
    @property
    def capacity_utilization(self) -> float:
        """Return capacity utilization percentage."""
        return (self.total_volume / self.driver.max_capacity) * 100


@dataclass
class OptimizationResult:
    """Complete optimization result for all drivers."""
    routes: List[OptimizedRoute]
    total_distance: float
    total_time: float
    total_points_covered: int
    
    # Global metrics
    average_workload: float
    workload_std_deviation: float
    total_red_covered: int
    total_yellow_covered: int
    total_green_covered: int
    
    # Optimization weights used
    priority_weight: float
    distance_weight: float
    balance_weight: float
    
    @property
    def workload_balance_score(self) -> float:
        """Return workload balance score (lower std dev = better balance)."""
        return max(0, 1 - (self.workload_std_deviation / self.average_workload))
    
    def get_route_by_driver(self, driver_id: str) -> Optional[OptimizedRoute]:
        """Get route for specific driver."""
        for route in self.routes:
            if route.driver.driver_id == driver_id:
                return route
        return None
