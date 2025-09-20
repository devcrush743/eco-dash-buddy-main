import { useState } from "react";
import { MapPin, Navigation, AlertTriangle, CheckCircle, Users, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  type: "complaint" | "driver" | "completed";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  time: string;
}

const MapInterface = () => {
  const { toast } = useToast();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Mock data for map markers
  const markers: MapMarker[] = [
    {
      id: 1,
      lat: 28.6139,
      lng: 77.2090,
      type: "complaint",
      priority: "high",
      title: "Overflowing Waste Bins",
      description: "Multiple bins overflowing at Green Park intersection",
      time: "15 mins ago"
    },
    {
      id: 2,
      lat: 28.6129,
      lng: 77.2095,
      type: "driver",
      priority: "medium",
      title: "Collection Vehicle #47",
      description: "Currently collecting waste in Sector 15",
      time: "Active"
    },
    {
      id: 3,
      lat: 28.6149,
      lng: 77.2085,
      type: "completed",
      priority: "low",
      title: "Resolved Issue",
      description: "Waste collection completed successfully",
      time: "2 hours ago"
    }
  ];

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  const handleNavigateToMarker = (marker: MapMarker) => {
    toast({
      title: "Navigation Started",
      description: `Navigating to ${marker.title}`,
    });
  };

  const getMarkerColor = (marker: MapMarker) => {
    if (marker.type === "completed") return "text-success";
    if (marker.type === "driver") return "text-primary";
    return marker.priority === "high" ? "text-destructive" : 
           marker.priority === "medium" ? "text-warning" : "text-muted-foreground";
  };

  const getMarkerIcon = (marker: MapMarker) => {
    if (marker.type === "completed") return CheckCircle;
    if (marker.type === "driver") return Truck;
    return AlertTriangle;
  };

  return (
    <div className="h-screen bg-gradient-map relative">
      {/* Map Container */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-muted/10">
        {/* Simulated map background */}
        <div className="w-full h-full bg-gradient-map relative overflow-hidden">
          {/* Grid pattern to simulate map */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
              {Array.from({ length: 400 }, (_, i) => (
                <div key={i} className="border border-primary/20" />
              ))}
            </div>
          </div>

          {/* Map markers */}
          {markers.map((marker) => {
            const Icon = getMarkerIcon(marker);
            return (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${40 + (marker.id * 15)}%`,
                  top: `${30 + (marker.id * 10)}%`
                }}
                onClick={() => handleMarkerClick(marker)}
              >
                <div className={`relative ${getMarkerColor(marker)} group-hover:scale-110 transition-transform`}>
                  <div className="bg-card shadow-lg rounded-full p-3 border-2 border-current">
                    <Icon className="h-6 w-6" />
                  </div>
                  {marker.priority === "high" && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 space-y-1 sm:space-y-2">
        <Button variant="outline" className="bg-card shadow-lg h-8 w-8 sm:h-10 sm:w-10 p-0">
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="outline" className="bg-card shadow-lg h-8 w-8 sm:h-10 sm:w-10 p-0">
          <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="outline" className="bg-card shadow-lg h-8 w-8 sm:h-10 sm:w-10 p-0">
          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 p-2 sm:p-4 bg-card/95 backdrop-blur max-w-[200px] sm:max-w-none">
        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Map Legend</h3>
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
            <span className="truncate">High Priority Issues</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-warning flex-shrink-0" />
            <span className="truncate">Medium Priority</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <span className="truncate">Active Drivers</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
            <span className="truncate">Completed Tasks</span>
          </div>
        </div>
      </Card>

      {/* Marker Details Panel */}
      {selectedMarker && (
        <Card className="absolute top-2 left-2 sm:top-4 sm:left-4 p-3 sm:p-4 bg-card/95 backdrop-blur max-w-[calc(100vw-1rem)] sm:max-w-sm">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">{selectedMarker.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{selectedMarker.description}</p>
                <p className="text-xs text-muted-foreground">{selectedMarker.time}</p>
              </div>
              <Badge variant={
                selectedMarker.priority === "high" ? "destructive" :
                selectedMarker.priority === "medium" ? "default" : "secondary"
              } className="text-xs flex-shrink-0">
                {selectedMarker.priority}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleNavigateToMarker(selectedMarker)}
                className="flex-1 text-xs sm:text-sm"
              >
                <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Navigate
              </Button>
              <Button 
                size="sm" 
                onClick={() => setSelectedMarker(null)}
                variant="ghost"
                className="text-xs sm:text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Live Stats */}
      <Card className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 p-2 sm:p-4 bg-card/95 backdrop-blur">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <div className="text-sm sm:text-lg font-bold text-destructive">5</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-primary">12</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-success">28</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MapInterface;