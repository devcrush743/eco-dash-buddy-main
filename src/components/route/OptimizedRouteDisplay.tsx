import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Truck, 
  Package, 
  Route,
  AlertTriangle,
  CheckCircle,
  Circle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Stop {
  stop_number: number;
  pickup_id: string;
  location: {
    lat: number;
    lng: number;
  };
  priority: 'red' | 'yellow' | 'green';
  volume_m3: number;
  description: string;
  distance_from_previous_km: number;
  estimated_travel_time_minutes: number;
  navigation_url: string;
}

interface RouteData {
  driver_id: string;
  driver_name: string;
  base_location: {
    lat: number;
    lng: number;
  };
  route_summary: {
    total_stops: number;
    total_distance_km: number;
    estimated_time_minutes: number;
    total_volume_m3: number;
    capacity_utilization_percent: number;
  };
  priority_breakdown: {
    red_stops: number;
    yellow_stops: number;
    green_stops: number;
  };
  stops: Stop[];
}

interface OptimizationResult {
  optimization_summary: {
    total_drivers: number;
    total_pickup_points: number;
    total_distance_km: number;
    total_time_minutes: number;
    points_covered: number;
    priority_coverage: {
      red: number;
      yellow: number;
      green: number;
    };
    quality_metrics: {
      overall_score: number;
      priority_coverage_score: number;
      distance_efficiency_score: number;
      workload_balance_score: number;
    };
  };
  driver_routes: Record<string, RouteData>;
}

const PriorityIcon = ({ priority }: { priority: 'red' | 'yellow' | 'green' }) => {
  const icons = {
    red: <AlertTriangle className="h-4 w-4 text-red-600" />,
    yellow: <Circle className="h-4 w-4 text-yellow-600" />,
    green: <CheckCircle className="h-4 w-4 text-green-600" />
  };
  return icons[priority];
};

const PriorityBadge = ({ priority }: { priority: 'red' | 'yellow' | 'green' }) => {
  const variants = {
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    green: 'bg-green-100 text-green-800 border-green-200'
  };
  
  return (
    <Badge className={`${variants[priority]} border`}>
      <PriorityIcon priority={priority} />
      <span className="ml-1 capitalize">{priority}</span>
    </Badge>
  );
};

const RouteStopCard = ({ stop, isLast }: { stop: Stop; isLast: boolean }) => {
  return (
    <div className="relative">
      <div className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        {/* Stop Number */}
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {stop.stop_number}
        </div>
        
        {/* Stop Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{stop.pickup_id}</h4>
            <PriorityBadge priority={stop.priority} />
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{stop.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {stop.location.lat.toFixed(4)}, {stop.location.lng.toFixed(4)}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {stop.volume_m3.toFixed(1)} m³
            </span>
          </div>
          
          {stop.stop_number > 1 && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Route className="h-3 w-3" />
                {stop.distance_from_previous_km.toFixed(1)} km from previous
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stop.estimated_travel_time_minutes} min travel
              </span>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(stop.navigation_url, '_blank')}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Open in Maps
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </div>
      
      {/* Connection Line */}
      {!isLast && (
        <div className="absolute left-8 top-20 w-0.5 h-6 bg-gray-300 transform -translate-x-0.5"></div>
      )}
    </div>
  );
};

const DriverRouteCard = ({ route }: { route: RouteData }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{route.driver_name}</CardTitle>
              <p className="text-sm text-gray-500">Driver ID: {route.driver_id}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Route Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{route.route_summary.total_stops}</div>
            <div className="text-xs text-gray-600">Stops</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{route.route_summary.total_distance_km}</div>
            <div className="text-xs text-gray-600">km</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{route.route_summary.estimated_time_minutes}</div>
            <div className="text-xs text-gray-600">minutes</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{route.route_summary.capacity_utilization_percent.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">capacity</div>
          </div>
        </div>
        
        {/* Priority Breakdown */}
        <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Priority Stops:</span>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm">{route.priority_breakdown.red_stops} Red</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">{route.priority_breakdown.yellow_stops} Yellow</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm">{route.priority_breakdown.green_stops} Green</span>
          </div>
        </div>
        
        {/* Detailed Route */}
        {expanded && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4">Turn-by-turn Route</h4>
            {route.stops.map((stop, index) => (
              <RouteStopCard 
                key={stop.pickup_id} 
                stop={stop} 
                isLast={index === route.stops.length - 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const OptimizationSummary = ({ summary }: { summary: OptimizationResult['optimization_summary'] }) => {
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5 text-blue-600" />
          Optimization Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{summary.total_drivers}</div>
            <div className="text-sm text-gray-600">Drivers</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-3xl font-bold text-green-600">{summary.total_pickup_points}</div>
            <div className="text-sm text-gray-600">Pickup Points</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{summary.total_distance_km}</div>
            <div className="text-sm text-gray-600">Total km</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-3xl font-bold text-orange-600">{summary.total_time_minutes}</div>
            <div className="text-sm text-gray-600">Total minutes</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority Coverage */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Priority Coverage</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  High Priority (Red)
                </span>
                <span className="font-bold">{summary.priority_coverage.red}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-yellow-600" />
                  Medium Priority (Yellow)
                </span>
                <span className="font-bold">{summary.priority_coverage.yellow}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Low Priority (Green)
                </span>
                <span className="font-bold">{summary.priority_coverage.green}</span>
              </div>
            </div>
          </div>
          
          {/* Quality Metrics */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Quality Metrics</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Score</span>
                <span className="font-bold">{(summary.quality_metrics.overall_score * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Priority Coverage</span>
                <span className="font-bold">{(summary.quality_metrics.priority_coverage_score * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Distance Efficiency</span>
                <span className="font-bold">{(summary.quality_metrics.distance_efficiency_score * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Workload Balance</span>
                <span className="font-bold">{(summary.quality_metrics.workload_balance_score * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface OptimizedRouteDisplayProps {
  optimizationResult: OptimizationResult;
  onClose?: () => void;
}

export const OptimizedRouteDisplay: React.FC<OptimizedRouteDisplayProps> = ({ 
  optimizationResult, 
  onClose 
}) => {
  const driverRoutes = Object.values(optimizationResult.driver_routes);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">🚛 Optimized Routes</h2>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      {/* Summary */}
      <OptimizationSummary summary={optimizationResult.optimization_summary} />
      
      {/* Individual Driver Routes */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Driver Routes</h3>
        {driverRoutes.map((route) => (
          <DriverRouteCard key={route.driver_id} route={route} />
        ))}
      </div>
      
      {/* Footer Actions */}
      <div className="flex gap-4 pt-6 border-t">
        <Button className="flex-1 bg-green-600 hover:bg-green-700">
          ✅ Assign All Routes
        </Button>
        <Button variant="outline" className="flex-1">
          📱 Export for Mobile
        </Button>
        <Button variant="outline" className="flex-1">
          🔄 Re-optimize
        </Button>
      </div>
    </div>
  );
};

export default OptimizedRouteDisplay;
