#!/usr/bin/env python3
"""
Simple Flask API server for route optimization.
This provides a REST endpoint that the React app can call.
"""

import os
import sys
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Add current directory to path for importing route_optimization
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from route_optimization import optimize_waste_collection_routes

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

@app.route('/')
def home():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "message": "Route Optimization API Server",
        "endpoints": {
            "/optimize": "POST - Optimize routes with pickup and driver data",
            "/optimize-driver": "POST - Get driver-specific optimized locations",
            "/test": "GET - Test optimization with sample data",
            "/health": "GET - Health check"
        }
    })

@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "route-optimization"})

@app.route('/optimize', methods=['POST'])
def optimize_routes():
    """
    Optimize routes endpoint.
    
    Expected JSON payload:
    {
        "pickup_points": [
            {
                "pickup_id": "P1",
                "lat": 28.6139,
                "lng": 77.2090,
                "priority_flag": "red",
                "volume": 2.5,
                "description": "..."
            }
        ],
        "drivers": [
            {
                "driver_id": "D1",
                "base_lat": 28.6130,
                "base_lng": 77.2080,
                "max_capacity": 50.0,
                "name": "Driver Name"
            }
        ],
        "options": {
            "priority_weight": 0.4,
            "distance_weight": 0.4,
            "balance_weight": 0.2
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        pickup_points = data.get('pickup_points', [])
        drivers = data.get('drivers', [])
        options = data.get('options', {})
        
        if not pickup_points:
            return jsonify({"error": "No pickup points provided"}), 400
        
        if not drivers:
            return jsonify({"error": "No drivers provided"}), 400
        
        # Validate pickup points
        for i, point in enumerate(pickup_points):
            required_fields = ['pickup_id', 'lat', 'lng', 'priority_flag', 'volume']
            for field in required_fields:
                if field not in point:
                    return jsonify({"error": f"Pickup point {i} missing required field: {field}"}), 400
        
        # Validate drivers
        for i, driver in enumerate(drivers):
            required_fields = ['driver_id', 'base_lat', 'base_lng']
            for field in required_fields:
                if field not in driver:
                    return jsonify({"error": f"Driver {i} missing required field: {field}"}), 400
        
        # Run optimization
        print(f"🚛 Optimizing routes for {len(drivers)} drivers and {len(pickup_points)} pickup points")
        
        result = optimize_waste_collection_routes(
            pickup_points_data=pickup_points,
            drivers_data=drivers,
            google_maps_api_key=None,  # Can be configured later
            priority_weight=options.get('priority_weight', 0.4),
            distance_weight=options.get('distance_weight', 0.4),
            balance_weight=options.get('balance_weight', 0.2)
        )
        
        print("✅ Optimization completed successfully")
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Optimization failed: {str(e)}")
        return jsonify({"error": f"Optimization failed: {str(e)}"}), 500

@app.route('/optimize-driver', methods=['POST'])
def optimize_driver_routes():
    """
    Driver-specific optimization endpoint.
    Returns only the locations assigned to the specific driver.
    
    Expected JSON payload:
    {
        "pickup_points": [...],
        "drivers": [...],
        "target_driver_id": "DRIVER001",
        "options": {...}
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        pickup_points = data.get('pickup_points', [])
        drivers = data.get('drivers', [])
        target_driver_id = data.get('target_driver_id')
        options = data.get('options', {})
        
        if not pickup_points:
            return jsonify({"error": "No pickup points provided"}), 400
        
        if not drivers:
            return jsonify({"error": "No drivers provided"}), 400
        
        if not target_driver_id:
            return jsonify({"error": "target_driver_id is required"}), 400
        
        # Find target driver
        target_driver = None
        for driver in drivers:
            if driver['driver_id'] == target_driver_id:
                target_driver = driver
                break
        
        if not target_driver:
            return jsonify({"error": f"Driver {target_driver_id} not found"}), 400
        
        print(f"🚛 Optimizing routes for driver {target_driver_id} with {len(pickup_points)} pickup points")
        
        # Run full optimization
        result = optimize_waste_collection_routes(
            pickup_points_data=pickup_points,
            drivers_data=drivers,
            google_maps_api_key=None,
            priority_weight=options.get('priority_weight', 0.4),
            distance_weight=options.get('distance_weight', 0.4),
            balance_weight=options.get('balance_weight', 0.2)
        )
        
        # Extract only the target driver's route
        driver_route = result.get('driver_routes', {}).get(target_driver_id)
        
        if not driver_route:
            return jsonify({
                "error": f"No route found for driver {target_driver_id}",
                "driver_id": target_driver_id,
                "assigned_locations": []
            }), 404
        
        # Format response for driver-specific use
        assigned_locations = []
        if driver_route.get('stops'):
            assigned_locations = [
                {
                    'pickup_id': stop['pickup_id'],
                    'lat': stop['location']['lat'],
                    'lng': stop['location']['lng'],
                    'priority': stop['priority'],
                    'description': stop.get('description', ''),
                    'stop_number': stop['stop_number'],
                    'volume_m3': stop.get('volume_m3', 0)
                }
                for stop in driver_route['stops']
            ]
        
        response = {
            "driver_id": target_driver_id,
            "driver_name": driver_route.get('driver_name', 'Unknown'),
            "route_summary": driver_route.get('route_summary', {}),
            "assigned_locations": assigned_locations,
            "total_locations": len(assigned_locations),
            "driver_base_location": {
                "lat": target_driver['base_lat'],
                "lng": target_driver['base_lng']
            }
        }
        
        print(f"✅ Driver-specific optimization completed for {target_driver_id}: {len(assigned_locations)} locations")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Driver optimization failed: {str(e)}")
        return jsonify({"error": f"Driver optimization failed: {str(e)}"}), 500


if __name__ == '__main__':
    # Get port from environment variable (Railway/Heroku) or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    print("🚛 Starting Route Optimization API Server...")
    print("📡 Available endpoints:")
    print("   GET  /            - API info")
    print("   GET  /health      - Health check") 
    print("   POST /optimize    - Optimize routes with real data")
    print("   POST /optimize-driver - Get driver-specific locations")
    print(f"\n🌐 Server will start at http://0.0.0.0:{port}")
    print(f"🔗 To test: curl http://localhost:{port}/health")
    print()
    
    app.run(debug=False, host='0.0.0.0', port=port)
