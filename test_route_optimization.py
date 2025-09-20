#!/usr/bin/env python3
"""
Simple test script to verify route optimization module works correctly.
Run this to test the installation and basic functionality.
"""

import sys
import traceback

def test_imports():
    """Test that all modules can be imported."""
    print("🔧 Testing imports...")
    
    try:
        from route_optimization import (
            RouteOptimizer, PickupPoint, Driver, PriorityFlag,
            optimize_waste_collection_routes
        )
        print("   ✅ All imports successful")
        return True
    except Exception as e:
        print(f"   ❌ Import error: {e}")
        return False

def test_basic_functionality():
    """Test basic route optimization functionality."""
    print("\n🧪 Testing basic functionality...")
    
    try:
        from route_optimization import RouteOptimizer, PickupPoint, Driver, PriorityFlag
        
        # Create minimal test data
        pickup_points = [
            PickupPoint("P1", 28.6139, 77.2090, PriorityFlag.RED, 2.5),
            PickupPoint("P2", 28.6140, 77.2095, PriorityFlag.YELLOW, 1.8),
            PickupPoint("P3", 28.6141, 77.2100, PriorityFlag.GREEN, 1.2),
        ]
        
        drivers = [
            Driver("D1", 28.6130, 77.2080, max_capacity=50.0),
        ]
        
        # Test optimization
        optimizer = RouteOptimizer(google_maps_api_key=None)
        result = optimizer.optimize_routes(pickup_points, drivers)
        
        # Verify result
        assert len(result.routes) == 1
        assert result.routes[0].total_stops == 3
        assert result.total_points_covered == 3
        assert result.total_red_covered == 1
        assert result.total_yellow_covered == 1
        assert result.total_green_covered == 1
        
        print("   ✅ Basic optimization test passed")
        return True
        
    except Exception as e:
        print(f"   ❌ Basic functionality test failed: {e}")
        traceback.print_exc()
        return False

def test_convenience_function():
    """Test the convenience function with dict inputs."""
    print("\n📦 Testing convenience function...")
    
    try:
        from route_optimization import optimize_waste_collection_routes
        
        pickup_data = [
            {
                "pickup_id": "P1",
                "lat": 28.6139,
                "lng": 77.2090,
                "priority_flag": "red",
                "volume": 2.5,
                "description": "Test point 1"
            },
            {
                "pickup_id": "P2", 
                "lat": 28.6140,
                "lng": 77.2095,
                "priority_flag": "yellow",
                "volume": 1.8,
                "description": "Test point 2"
            }
        ]
        
        driver_data = [
            {
                "driver_id": "D1",
                "base_lat": 28.6130,
                "base_lng": 77.2080,
                "max_capacity": 50.0,
                "name": "Test Driver"
            }
        ]
        
        result = optimize_waste_collection_routes(pickup_data, driver_data)
        
        # Verify structure
        assert "optimization_summary" in result
        assert "driver_routes" in result
        assert "D1" in result["driver_routes"]
        
        summary = result["optimization_summary"]
        assert summary["total_pickup_points"] == 2
        assert summary["total_drivers"] == 1
        assert summary["points_covered"] == 2
        
        print("   ✅ Convenience function test passed")
        return True
        
    except Exception as e:
        print(f"   ❌ Convenience function test failed: {e}")
        traceback.print_exc()
        return False

def test_edge_cases():
    """Test edge cases and error handling."""
    print("\n🚨 Testing edge cases...")
    
    try:
        from route_optimization import RouteOptimizer, PickupPoint, Driver, PriorityFlag
        
        optimizer = RouteOptimizer()
        
        # Test empty inputs
        result = optimizer.optimize_routes([], [])
        assert len(result.routes) == 0
        assert result.total_points_covered == 0
        
        # Test single point
        pickup_points = [PickupPoint("P1", 28.6139, 77.2090, PriorityFlag.RED, 2.5)]
        drivers = [Driver("D1", 28.6130, 77.2080)]
        
        result = optimizer.optimize_routes(pickup_points, drivers)
        assert len(result.routes) == 1
        assert result.routes[0].total_stops == 1
        
        print("   ✅ Edge cases test passed")
        return True
        
    except Exception as e:
        print(f"   ❌ Edge cases test failed: {e}")
        traceback.print_exc()
        return False

def test_data_validation():
    """Test input validation."""
    print("\n🔍 Testing data validation...")
    
    try:
        from route_optimization import PickupPoint, Driver, PriorityFlag
        
        # Test invalid coordinates
        try:
            PickupPoint("P1", 95.0, 77.2090, PriorityFlag.RED, 2.5)  # Invalid lat
            assert False, "Should have raised ValueError for invalid latitude"
        except ValueError:
            pass  # Expected
        
        try:
            Driver("D1", 28.6130, 200.0)  # Invalid lng
            assert False, "Should have raised ValueError for invalid longitude"
        except ValueError:
            pass  # Expected
        
        # Test negative volume
        try:
            PickupPoint("P1", 28.6139, 77.2090, PriorityFlag.RED, -1.0)
            assert False, "Should have raised ValueError for negative volume"
        except ValueError:
            pass  # Expected
        
        print("   ✅ Data validation test passed")
        return True
        
    except Exception as e:
        print(f"   ❌ Data validation test failed: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("🚛 Swachh Saarthi Route Optimization - Test Suite")
    print("=" * 60)
    
    tests = [
        test_imports,
        test_basic_functionality,
        test_convenience_function,
        test_edge_cases,
        test_data_validation,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"   ❌ Test {test.__name__} crashed: {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Route optimization module is working correctly.")
        print("\n🚀 Next steps:")
        print("   1. Run 'python route_optimization/example_usage.py' for detailed examples")
        print("   2. Install dependencies: 'pip install -r route_optimization/requirements.txt'")
        print("   3. Get Google Maps API key for production use")
        return True
    else:
        print(f"❌ {total - passed} tests failed. Please check the error messages above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
