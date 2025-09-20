#!/usr/bin/env python3
"""
Firestore integration script for route optimization.
Reads data from Firestore, optimizes routes, and outputs results.
"""

import os
import sys
import json
import argparse
from typing import List, Dict, Any

# Add parent directory to path for importing route_optimization
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from route_optimization import optimize_waste_collection_routes


def estimate_volume_from_description(description: str) -> float:
    """
    Estimate waste volume based on description.
    This is a simple heuristic - you can improve this based on your data.
    """
    description = description.lower()
    
    # Keywords that suggest higher volume
    high_volume_keywords = ['overflowing', 'full', 'large', 'market', 'commercial', 'school']
    medium_volume_keywords = ['medium', 'normal', 'regular', 'residential']
    
    base_volume = 2.0  # Default volume in cubic meters
    
    if any(keyword in description for keyword in high_volume_keywords):
        return base_volume * 1.5  # 3.0 m³
    elif any(keyword in description for keyword in medium_volume_keywords):
        return base_volume  # 2.0 m³
    else:
        return base_volume * 0.75  # 1.5 m³


def convert_firestore_reports_to_pickup_data(reports: List[Dict]) -> List[Dict]:
    """
    Convert Firestore reports to pickup point format for optimization.
    
    Args:
        reports: List of report documents from Firestore
        
    Returns:
        List of pickup point dictionaries
    """
    pickup_data = []
    
    for report in reports:
        # Skip if not open/unassigned
        if report.get('status') not in ['open', 'reported', 'pending']:
            continue
            
        # Extract coordinates
        coords = report.get('coords', {})
        if not coords or 'lat' not in coords or 'lng' not in coords:
            print(f"⚠️  Skipping report {report.get('id', 'unknown')} - missing coordinates")
            continue
        
        # Determine priority based on report data
        priority = report.get('priority', 'green')
        if priority not in ['red', 'yellow', 'green']:
            # Map other priority indicators
            if report.get('urgent', False) or 'urgent' in report.get('description', '').lower():
                priority = 'red'
            elif 'moderate' in report.get('description', '').lower():
                priority = 'yellow'
            else:
                priority = 'green'
        
        # Estimate volume
        volume = estimate_volume_from_description(report.get('description', ''))
        
        pickup_point = {
            'pickup_id': report.get('id', f"report_{len(pickup_data)}"),
            'lat': float(coords['lat']),
            'lng': float(coords['lng']),
            'priority_flag': priority,
            'volume': volume,
            'description': report.get('description', 'Waste collection point')
        }
        
        pickup_data.append(pickup_point)
    
    return pickup_data


def convert_firestore_drivers_to_driver_data(drivers: List[Dict]) -> List[Dict]:
    """
    Convert Firestore driver data to driver format for optimization.
    
    Args:
        drivers: List of driver documents from Firestore
        
    Returns:
        List of driver dictionaries
    """
    driver_data = []
    
    for driver in drivers:
        # Skip inactive drivers
        if not driver.get('active', True):
            continue
        
        # Extract base location
        base_location = driver.get('baseLocation', {})
        if not base_location or 'lat' not in base_location or 'lng' not in base_location:
            print(f"⚠️  Skipping driver {driver.get('driverId', 'unknown')} - missing base location")
            continue
        
        driver_info = {
            'driver_id': driver.get('driverId', driver.get('id', f"driver_{len(driver_data)}")),
            'base_lat': float(base_location['lat']),
            'base_lng': float(base_location['lng']),
            'max_capacity': float(driver.get('maxCapacity', driver.get('vehicleCapacity', 50.0))),
            'name': driver.get('name', driver.get('driverName', 'Unknown Driver'))
        }
        
        driver_data.append(driver_info)
    
    return driver_data


def optimize_from_json_files(reports_file: str, drivers_file: str, output_file: str = None):
    """
    Optimize routes from JSON files (for testing/development).
    
    Args:
        reports_file: Path to JSON file containing reports
        drivers_file: Path to JSON file containing drivers
        output_file: Optional output file path
    """
    print(f"🔍 Reading reports from {reports_file}")
    with open(reports_file, 'r') as f:
        reports = json.load(f)
    
    print(f"🔍 Reading drivers from {drivers_file}")
    with open(drivers_file, 'r') as f:
        drivers = json.load(f)
    
    # Convert to optimization format
    pickup_data = convert_firestore_reports_to_pickup_data(reports)
    driver_data = convert_firestore_drivers_to_driver_data(drivers)
    
    print(f"📊 Converted {len(pickup_data)} reports and {len(driver_data)} drivers")
    
    if not pickup_data:
        print("❌ No valid pickup points found")
        return None
    
    if not driver_data:
        print("❌ No valid drivers found")
        return None
    
    # Run optimization
    print("🚛 Running route optimization...")
    result = optimize_waste_collection_routes(
        pickup_points_data=pickup_data,
        drivers_data=driver_data,
        google_maps_api_key=None,  # Can be added later
        priority_weight=0.4,
        distance_weight=0.4,
        balance_weight=0.2
    )
    
    # Save results
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2, default=str)
        print(f"💾 Results saved to {output_file}")
    
    return result




def main():
    """Main function with command line interface."""
    parser = argparse.ArgumentParser(description='Route Optimization with Firestore Integration')
    parser.add_argument('--reports', '-r', help='Path to reports JSON file')
    parser.add_argument('--drivers', '-d', help='Path to drivers JSON file')
    parser.add_argument('--output', '-o', default='optimized_routes.json', help='Output file path')
    args = parser.parse_args()
    
    if args.reports and args.drivers:
        result = optimize_from_json_files(args.reports, args.drivers, args.output)
    else:
        print("❌ Please provide --reports and --drivers files")
        print("Example: python firestore_integration.py -r reports.json -d drivers.json")
        return
    
    if result:
        summary = result['optimization_summary']
        print(f"\n🎉 Optimization Complete!")
        print(f"   📊 {summary['total_drivers']} drivers, {summary['total_pickup_points']} pickup points")
        print(f"   📏 Total distance: {summary['total_distance_km']} km")
        print(f"   ⏰ Total time: {summary['total_time_minutes']} minutes") 
        print(f"   🎯 Priority coverage: {summary['priority_coverage']['red']}R/{summary['priority_coverage']['yellow']}Y/{summary['priority_coverage']['green']}G")
        print(f"   ⭐ Overall quality: {summary['quality_metrics']['overall_score']:.3f}")


if __name__ == "__main__":
    main()
