#!/usr/bin/env python3
"""
Example usage of the Route Optimization Module for Swachh Saarthi.

This script demonstrates how to use the route optimization system
with realistic waste collection data for Ghaziabad city.
"""

import json
import time
from route_optimization import (
    RouteOptimizer, PickupPoint, Driver, PriorityFlag,
    optimize_waste_collection_routes
)


def create_sample_data():
    """Create sample pickup points and drivers for demonstration."""
    
    # Sample pickup points in Ghaziabad area
    pickup_points_data = [
        # High priority (red flag) locations
        {
            "pickup_id": "P001",
            "lat": 28.6692,
            "lng": 77.4538,
            "priority_flag": "red",
            "volume": 4.5,
            "description": "Bus stand - overflowing bins, urgent"
        },
        {
            "pickup_id": "P002", 
            "lat": 28.6641,
            "lng": 77.4324,
            "priority_flag": "red",
            "volume": 3.8,
            "description": "Market area - illegal dumping reported"
        },
        {
            "pickup_id": "P003",
            "lat": 28.6583,
            "lng": 77.4419,
            "priority_flag": "red",
            "volume": 5.2,
            "description": "School area - health hazard"
        },
        
        # Medium priority (yellow flag) locations
        {
            "pickup_id": "P004",
            "lat": 28.6789,
            "lng": 77.4612,
            "priority_flag": "yellow",
            "volume": 2.3,
            "description": "Residential sector - regular collection"
        },
        {
            "pickup_id": "P005",
            "lat": 28.6701,
            "lng": 77.4501,
            "priority_flag": "yellow", 
            "volume": 3.1,
            "description": "Commercial complex"
        },
        {
            "pickup_id": "P006",
            "lat": 28.6634,
            "lng": 77.4387,
            "priority_flag": "yellow",
            "volume": 2.7,
            "description": "Metro station area"
        },
        {
            "pickup_id": "P007",
            "lat": 28.6612,
            "lng": 77.4445,
            "priority_flag": "yellow",
            "volume": 1.9,
            "description": "Office complex"
        },
        
        # Low priority (green flag) locations
        {
            "pickup_id": "P008",
            "lat": 28.6756,
            "lng": 77.4567,
            "priority_flag": "green",
            "volume": 1.5,
            "description": "Park area - routine maintenance"
        },
        {
            "pickup_id": "P009",
            "lat": 28.6678,
            "lng": 77.4423,
            "priority_flag": "green",
            "volume": 1.2,
            "description": "Residential colony"
        },
        {
            "pickup_id": "P010",
            "lat": 28.6598,
            "lng": 77.4356,
            "priority_flag": "green",
            "volume": 2.1,
            "description": "Community center"
        },
        {
            "pickup_id": "P011",
            "lat": 28.6723,
            "lng": 77.4489,
            "priority_flag": "green",
            "volume": 1.8,
            "description": "Shopping area"
        },
        {
            "pickup_id": "P012",
            "lat": 28.6645,
            "lng": 77.4401,
            "priority_flag": "green",
            "volume": 1.4,
            "description": "Temple complex"
        }
    ]
    
    # Sample drivers with different capacities and base locations
    drivers_data = [
        {
            "driver_id": "DRV001",
            "base_lat": 28.6650,
            "base_lng": 77.4400,
            "max_capacity": 25.0,
            "name": "Rajesh Kumar"
        },
        {
            "driver_id": "DRV002", 
            "base_lat": 28.6700,
            "base_lng": 77.4500,
            "max_capacity": 30.0,
            "name": "Amit Singh"
        },
        {
            "driver_id": "DRV003",
            "base_lat": 28.6600,
            "base_lng": 77.4350,
            "max_capacity": 20.0,
            "name": "Pradeep Sharma"
        }
    ]
    
    return pickup_points_data, drivers_data


def example_basic_optimization():
    """Example 1: Basic route optimization using object-oriented approach."""
    print("="*60)
    print("EXAMPLE 1: Basic Route Optimization")
    print("="*60)
    
    # Create sample data
    pickup_data, driver_data = create_sample_data()
    
    # Initialize optimizer (without Google Maps API for demo)
    optimizer = RouteOptimizer(google_maps_api_key=None)
    
    # Convert data to objects
    pickup_points = []
    for data in pickup_data:
        point = PickupPoint(
            pickup_id=data["pickup_id"],
            lat=data["lat"],
            lng=data["lng"],
            priority_flag=PriorityFlag(data["priority_flag"]),
            volume=data["volume"],
            description=data["description"]
        )
        pickup_points.append(point)
    
    drivers = []
    for data in driver_data:
        driver = Driver(
            driver_id=data["driver_id"],
            base_lat=data["base_lat"],
            base_lng=data["base_lng"],
            max_capacity=data["max_capacity"],
            name=data["name"]
        )
        drivers.append(driver)
    
    # Run optimization
    start_time = time.time()
    result = optimizer.optimize_routes(
        pickup_points=pickup_points,
        drivers=drivers,
        priority_weight=0.4,  # 40% weight for priority coverage
        distance_weight=0.4,   # 40% weight for distance efficiency  
        balance_weight=0.2     # 20% weight for workload balance
    )
    optimization_time = time.time() - start_time
    
    print(f"\n⏱️  Optimization completed in {optimization_time:.2f} seconds")
    print(f"📊 Results Summary:")
    print(f"   • Total distance: {result.total_distance:.1f} km")
    print(f"   • Total time: {result.total_time:.0f} minutes")
    print(f"   • Points covered: {result.total_points_covered}/{len(pickup_points)}")
    print(f"   • Priority coverage: {result.total_red_covered}R/{result.total_yellow_covered}Y/{result.total_green_covered}G")
    print(f"   • Workload balance score: {result.workload_balance_score:.3f}")
    
    # Show individual routes
    print(f"\n🚛 Individual Route Details:")
    for route in result.routes:
        print(f"\n   Driver {route.driver.driver_id} ({route.driver.name}):")
        print(f"      📏 Distance: {route.total_distance:.1f} km")
        print(f"      ⏰ Time: {route.total_time:.0f} minutes")
        print(f"      📦 Volume: {route.total_volume:.1f}/{route.driver.max_capacity} m³ ({route.capacity_utilization:.1f}%)")
        print(f"      🎯 Stops: {route.total_stops} ({route.red_stops}R/{route.yellow_stops}Y/{route.green_stops}G)")
        
        if route.stops:
            print(f"      📍 Route order:")
            for stop in route.stops[:3]:  # Show first 3 stops
                print(f"         {stop.order+1}. {stop.pickup_point.pickup_id} - {stop.pickup_point.priority_flag.value} priority")
            if len(route.stops) > 3:
                print(f"         ... and {len(route.stops)-3} more stops")
    
    # Analyze optimization quality
    quality = optimizer.analyze_optimization_quality(result)
    print(f"\n📈 Optimization Quality Analysis:")
    print(f"   • Overall score: {quality['overall_score']:.3f}")
    print(f"   • Priority coverage: {quality['priority_coverage_score']:.3f}")
    print(f"   • Distance efficiency: {quality['distance_efficiency_score']:.3f}")
    print(f"   • Workload balance: {quality['workload_balance_score']:.3f}")
    
    return result


def example_convenience_function():
    """Example 2: Using the convenience function with dict inputs."""
    print("\n" + "="*60)
    print("EXAMPLE 2: Convenience Function (Dict Input)")
    print("="*60)
    
    # Get sample data
    pickup_data, driver_data = create_sample_data()
    
    # Use convenience function
    start_time = time.time()
    result = optimize_waste_collection_routes(
        pickup_points_data=pickup_data,
        drivers_data=driver_data,
        google_maps_api_key=None,  # Use None for demo
        priority_weight=0.5,       # Emphasize priority more
        distance_weight=0.3,
        balance_weight=0.2
    )
    optimization_time = time.time() - start_time
    
    print(f"\n⏱️  Optimization completed in {optimization_time:.2f} seconds")
    
    # Display results
    summary = result["optimization_summary"]
    print(f"\n📊 Optimization Summary:")
    print(f"   • Drivers: {summary['total_drivers']}")
    print(f"   • Pickup points: {summary['total_pickup_points']}")
    print(f"   • Total distance: {summary['total_distance_km']} km")
    print(f"   • Total time: {summary['total_time_minutes']} minutes")
    print(f"   • Points covered: {summary['points_covered']}")
    
    priority_coverage = summary["priority_coverage"]
    print(f"   • Priority coverage: {priority_coverage['red']}R/{priority_coverage['yellow']}Y/{priority_coverage['green']}G")
    
    quality = summary["quality_metrics"]
    print(f"   • Overall quality: {quality['overall_score']}")
    
    print(f"\n🚛 Driver Route Summary:")
    for driver_id, route_data in result["driver_routes"].items():
        route_summary = route_data["route_summary"]
        priority_breakdown = route_data["priority_breakdown"]
        
        print(f"\n   {driver_id} ({route_data['driver_name']}):")
        print(f"      📏 {route_summary['total_distance_km']} km, ⏰ {route_summary['estimated_time_minutes']} min")
        print(f"      📦 {route_summary['total_volume_m3']} m³ ({route_summary['capacity_utilization_percent']}% capacity)")
        print(f"      🎯 {route_summary['total_stops']} stops: {priority_breakdown['red_stops']}R/{priority_breakdown['yellow_stops']}Y/{priority_breakdown['green_stops']}G")
    
    return result


def example_mobile_export(result):
    """Example 3: Export routes for mobile driver apps."""
    print("\n" + "="*60)
    print("EXAMPLE 3: Mobile App Export")
    print("="*60)
    
    # Get mobile-friendly data from convenience function result
    mobile_routes = result["driver_routes"]
    
    # Example: Export for a specific driver
    driver_id = "DRV001"
    if driver_id in mobile_routes:
        driver_route = mobile_routes[driver_id]
        
        print(f"\n📱 Mobile App Data for Driver {driver_id}:")
        print(f"   Driver: {driver_route['driver_name']}")
        print(f"   Base Location: {driver_route['base_location']}")
        print(f"   Route Summary: {driver_route['route_summary']}")
        
        print(f"\n📍 Turn-by-turn Navigation:")
        for i, stop in enumerate(driver_route['stops'][:5]):  # Show first 5 stops
            print(f"   Stop {stop['stop_number']}: {stop['pickup_id']}")
            print(f"      📍 Location: ({stop['location']['lat']:.4f}, {stop['location']['lng']:.4f})")
            print(f"      🎯 Priority: {stop['priority']} | Volume: {stop['volume_m3']} m³")
            print(f"      🗺️  Navigation: {stop['navigation_url']}")
            if i < len(driver_route['stops']) - 1:
                print(f"      ➡️  Next: {stop['distance_from_previous_km']} km, {stop['estimated_travel_time_minutes']} min")
            print()
        
        if len(driver_route['stops']) > 5:
            print(f"   ... and {len(driver_route['stops']) - 5} more stops")
    
    # Save to JSON file for mobile app consumption
    with open('optimized_routes_mobile.json', 'w') as f:
        json.dump(result, f, indent=2, default=str)
    
    print(f"\n💾 Routes exported to 'optimized_routes_mobile.json'")
    print(f"   This file can be consumed by mobile driver apps")


def example_assignment_suggestions():
    """Example 4: Get driver assignment suggestions before optimization."""
    print("\n" + "="*60)
    print("EXAMPLE 4: Driver Assignment Suggestions")
    print("="*60)
    
    pickup_data, driver_data = create_sample_data()
    
    # Convert to objects for optimizer
    optimizer = RouteOptimizer()
    
    pickup_points = [
        PickupPoint(
            pickup_id=data["pickup_id"],
            lat=data["lat"],
            lng=data["lng"],
            priority_flag=PriorityFlag(data["priority_flag"]),
            volume=data["volume"],
            description=data["description"]
        )
        for data in pickup_data
    ]
    
    drivers = [
        Driver(
            driver_id=data["driver_id"],
            base_lat=data["base_lat"],
            base_lng=data["base_lng"],
            max_capacity=data["max_capacity"],
            name=data["name"]
        )
        for data in driver_data
    ]
    
    # Get assignment suggestions
    suggestions = optimizer.suggest_driver_assignments(pickup_points, drivers)
    
    print(f"\n🎯 Suggested Driver Assignments (before optimization):")
    for driver_id, pickup_ids in suggestions.items():
        driver = next(d for d in drivers if d.driver_id == driver_id)
        total_volume = sum(p.volume for p in pickup_points if p.pickup_id in pickup_ids)
        
        print(f"\n   Driver {driver_id} ({driver.name}):")
        print(f"      📦 Total volume: {total_volume:.1f}/{driver.max_capacity} m³ ({total_volume/driver.max_capacity*100:.1f}%)")
        print(f"      📍 Assigned pickups: {len(pickup_ids)}")
        
        # Show priority breakdown
        red_count = sum(1 for p in pickup_points if p.pickup_id in pickup_ids and p.priority_flag == PriorityFlag.RED)
        yellow_count = sum(1 for p in pickup_points if p.pickup_id in pickup_ids and p.priority_flag == PriorityFlag.YELLOW)
        green_count = sum(1 for p in pickup_points if p.pickup_id in pickup_ids and p.priority_flag == PriorityFlag.GREEN)
        
        print(f"      🎯 Priority mix: {red_count}R/{yellow_count}Y/{green_count}G")
        print(f"      📋 Pickup IDs: {pickup_ids}")


def main():
    """Run all examples."""
    print("🚛 Swachh Saarthi Route Optimization Examples")
    print("=" * 60)
    
    try:
        # Run examples
        result1 = example_basic_optimization()
        result2 = example_convenience_function()
        example_mobile_export(result2)
        example_assignment_suggestions()
        
        print("\n" + "="*60)
        print("✅ All examples completed successfully!")
        print("="*60)
        
        print(f"\n📚 Next Steps:")
        print(f"   1. Get Google Maps API key for accurate road distances")
        print(f"   2. Integrate with your Firestore database")
        print(f"   3. Build REST API endpoints around the optimization functions")
        print(f"   4. Create mobile app interfaces using the exported JSON")
        print(f"   5. Add real-time tracking and route updates")
        
    except Exception as e:
        print(f"\n❌ Error running examples: {e}")
        raise


if __name__ == "__main__":
    main()
