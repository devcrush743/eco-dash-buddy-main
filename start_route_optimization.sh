#!/bin/bash

echo "🚛 Starting Swachh Saarthi Route Optimization System"
echo "=================================================="

# Check if Python dependencies are installed
echo "🔍 Checking Python dependencies..."
python -c "import route_optimization; print('✅ Route optimization module ready')" 2>/dev/null || {
    echo "❌ Route optimization module not found"
    echo "Installing dependencies..."
    pip install scikit-learn numpy requests
}

# Check if Flask is installed
python -c "import flask; print('✅ Flask ready')" 2>/dev/null || {
    echo "❌ Flask not found, installing..."
    pip install flask flask-cors
}

echo ""
echo "🚀 Starting Route Optimization API Server..."
echo "📡 Server will be available at: http://localhost:5000"
echo "🔄 Auto-restart enabled for development"
echo ""
echo "Available endpoints:"
echo "  GET  /health      - Health check"
echo "  POST /optimize    - Optimize routes"
echo "  GET  /test        - Test with sample data"
echo "  GET  /sample-data - Get sample data format"
echo ""
echo "To test the API:"
echo "  curl http://localhost:5000/test"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

# Start the Flask server
cd "$(dirname "$0")"
export PYTHONPATH="$(pwd)"
python route_optimization_server.py
