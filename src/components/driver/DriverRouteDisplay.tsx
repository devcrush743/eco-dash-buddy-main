import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Route,
  Loader2
} from 'lucide-react';

interface AssignedLocation {
  pickup_id: string;
  lat: number;
  lng: number;
  priority: 'red' | 'yellow' | 'green';
  description: string;
  stop_number: number;
  volume_m3: number;
}

interface DriverRouteData {
  driver_id: string;
  driver_name: string;
  route_summary: {
    total_stops: number;
    total_distance_km: number;
    estimated_time_minutes: number;
    total_volume_m3: number;
    capacity_utilization_percent: number;
  };
  assigned_locations: AssignedLocation[];
  total_locations: number;
  driver_base_location: {
    lat: number;
    lng: number;
  };
}

interface DriverRouteDisplayProps {
  routeData: DriverRouteData | null;
  onAssignRoutes: () => void;
  isAssigning: boolean;
  className?: string;
}

const DriverRouteDisplay: React.FC<DriverRouteDisplayProps> = ({
  routeData,
  onAssignRoutes,
  isAssigning,
  className = ''
}) => {
  const { toast } = useToast();
  const [isOpeningMaps, setIsOpeningMaps] = useState(false);

  const priorityColors = {
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    green: 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityIcons = {
    red: <AlertCircle className="h-4 w-4" />,
    yellow: <AlertCircle className="h-4 w-4" />,
    green: <CheckCircle className="h-4 w-4" />
  };

  const handleOpenGoogleMaps = async () => {
    if (!routeData || !routeData.assigned_locations.length) {
      toast({
        title: "No locations to navigate to",
        description: "Please get your assigned locations first",
        variant: "destructive",
      });
      return;
    }

    setIsOpeningMaps(true);
    
    try {
      // Generate Google Maps URL with all destinations
      const locations = routeData.assigned_locations;
      const baseLocation = routeData.driver_base_location;
      
      // Start with driver's base location
      let url = 'https://www.google.com/maps/dir/';
      
      // Add driver base location as starting point
      url += `${baseLocation.lat},${baseLocation.lng}/`;
      
      // Add all assigned locations as destinations
      locations.forEach((location, index) => {
        url += `${location.lat},${location.lng}`;
        if (index < locations.length - 1) {
          url += '/';
        }
      });
      
      // Add parameters for optimization
      url += '/data=!3m1!4b1!4m2!4m1!3e0';
      
      // Open in new tab
      window.open(url, '_blank');
      
      toast({
        title: "Google Maps opened! 🗺️",
        description: `Route with ${locations.length} destinations opened in Google Maps`,
      });
      
    } catch (error) {
      console.error('Failed to open Google Maps:', error);
      toast({
        title: "Failed to open Google Maps",
        description: "Please try again or copy the coordinates manually",
        variant: "destructive",
      });
    } finally {
      setIsOpeningMaps(false);
    }
  };

  if (!routeData) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Your Assigned Route
          </CardTitle>
          <CardDescription>
            Get your optimized route with assigned locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No route assigned yet. Click "Get My Route" to see your assigned locations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { route_summary, assigned_locations, driver_name } = routeData;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          Your Assigned Route
        </CardTitle>
        <CardDescription>
          Optimized route for {driver_name} - {route_summary.total_stops} locations assigned
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Route Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{route_summary.total_stops}</div>
            <div className="text-sm text-blue-600">Total Stops</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{route_summary.total_distance_km.toFixed(1)} km</div>
            <div className="text-sm text-green-600">Total Distance</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{Math.round(route_summary.estimated_time_minutes)} min</div>
            <div className="text-sm text-orange-600">Est. Time</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{route_summary.capacity_utilization_percent.toFixed(0)}%</div>
            <div className="text-sm text-purple-600">Capacity Used</div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="flex gap-2 justify-center">
          {assigned_locations.filter(loc => loc.priority === 'red').length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              {assigned_locations.filter(loc => loc.priority === 'red').length} Urgent
            </Badge>
          )}
          {assigned_locations.filter(loc => loc.priority === 'yellow').length > 0 && (
            <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3" />
              {assigned_locations.filter(loc => loc.priority === 'yellow').length} Moderate
            </Badge>
          )}
          {assigned_locations.filter(loc => loc.priority === 'green').length > 0 && (
            <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3" />
              {assigned_locations.filter(loc => loc.priority === 'green').length} Normal
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleOpenGoogleMaps}
            disabled={isOpeningMaps || !assigned_locations.length}
            className="flex-1 gap-2"
            size="lg"
          >
            {isOpeningMaps ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {isOpeningMaps ? 'Opening Maps...' : 'Open in Google Maps'}
            <ExternalLink className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={onAssignRoutes}
            disabled={isAssigning || !assigned_locations.length}
            variant="outline"
            className="flex-1 gap-2"
            size="lg"
          >
            {isAssigning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </div>

        {/* Assigned Locations List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Assigned Locations ({assigned_locations.length})
          </h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {assigned_locations.map((location, index) => (
              <div 
                key={location.pickup_id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {location.stop_number}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${priorityColors[location.priority]}`}
                    >
                      {priorityIcons[location.priority]}
                      <span className="ml-1 capitalize">{location.priority}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {location.volume_m3.toFixed(1)} m³
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {location.description || 'Waste collection point'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
                    window.open(url, '_blank');
                  }}
                  className="flex-shrink-0"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverRouteDisplay;
