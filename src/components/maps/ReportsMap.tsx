import { useEffect, useRef, useState } from 'react';
import { BaseMap, MapRef } from './BaseMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { REPORT_COLORS } from '@/config/maptiler';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Eye,
  Navigation
} from 'lucide-react';

interface Report {
  id: string;
  description: string;
  reporterId: string;
  coords: { lat: number; lng: number };
  reportedAt: Timestamp;
  status: 'open' | 'assigned' | 'collected' | 'approved' | 'rejected';
  priority: 'normal' | 'redflag';
  collectedAt?: Timestamp;
  approvedAt?: Timestamp;
  driverId?: string;
}

interface ReportsMapProps {
  className?: string;
  showUserReportsOnly?: boolean;
  userId?: string;
  onReportClick?: (report: Report) => void;
  center?: [number, number];
  zoom?: number;
}

export const ReportsMap = ({
  className = "w-full h-96",
  showUserReportsOnly = false,
  userId,
  onReportClick,
  center,
  zoom = 12
}: ReportsMapProps) => {
  const mapRef = useRef<MapRef>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to reports from Firestore
  useEffect(() => {
    let reportsQuery;
    
    if (showUserReportsOnly && userId) {
      reportsQuery = query(
        collection(db, 'reports'),
        where('reporterId', '==', userId)
      );
    } else {
      reportsQuery = query(collection(db, 'reports'));
    }

    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      
      setReports(reportsData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching reports:', error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [showUserReportsOnly, userId]);

  // Add markers when reports change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    // Clear all existing markers first
    map.clearAllMarkers();
    
    // Add new markers for all current reports
    reports.forEach(report => {
      const coords: [number, number] = [report.coords.lng, report.coords.lat];
      const color = report.priority === 'redflag' 
        ? REPORT_COLORS.redflag 
        : REPORT_COLORS[report.status];

      const popupContent = `
        <div class="p-3 min-w-64">
          <div class="flex items-center gap-2 mb-2">
            <span class="font-semibold">${report.priority === 'redflag' ? '🚨' : '📍'} Report</span>
            <span class="px-2 py-1 rounded text-xs text-white" style="background-color: ${color}">
              ${report.status.toUpperCase()}
            </span>
          </div>
          <p class="text-sm mb-2 line-clamp-2">${report.description}</p>
          <p class="text-xs text-gray-500">
            ${report.reportedAt ? 
              (report.reportedAt.toDate ? report.reportedAt.toDate().toLocaleDateString() : 'Date unavailable') :
              'Date unavailable'
            }
          </p>
          <button 
            class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            onclick="window.dispatchEvent(new CustomEvent('reportMarkerClick', { detail: '${report.id}' }))"
          >
            View Details
          </button>
        </div>
      `;

      const markerClassName = report.priority === 'redflag' ? 'report-marker urgent' : 'report-marker';
      
      map.addMarker(coords, {
        color,
        popup: popupContent,
        className: markerClassName.trim()
      });
    });

    // Fit map to show all markers if there are reports
    if (reports.length > 0) {
      const bounds = reports.reduce((bounds, report) => {
        const lng = report.coords.lng;
        const lat = report.coords.lat;
        
        return [
          [Math.min(bounds[0][0], lng), Math.min(bounds[0][1], lat)], // Southwest
          [Math.max(bounds[1][0], lng), Math.max(bounds[1][1], lat)]  // Northeast
        ];
      }, [[180, 90], [-180, -90]]) as [[number, number], [number, number]];

      map.fitBounds(bounds);
    } else {
      // Reset to default view when no reports
      map.flyTo([77.2090, 28.6139], 12); // Default to Delhi, India
    }
  }, [reports]);

  // Handle report marker clicks
  useEffect(() => {
    const handleMarkerClick = (event: CustomEvent) => {
      const reportId = event.detail;
      const report = reports.find(r => r.id === reportId);
      if (report) {
        setSelectedReport(report);
        onReportClick?.(report);
      }
    };

    window.addEventListener('reportMarkerClick', handleMarkerClick as EventListener);
    return () => {
      window.removeEventListener('reportMarkerClick', handleMarkerClick as EventListener);
    };
  }, [reports, onReportClick]);

  const getStatusColor = (status: string, priority: string) => {
    if (priority === 'redflag') return 'bg-red-600';
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'assigned': return 'bg-yellow-500';
      case 'collected': return 'bg-orange-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const navigateToReport = (report: Report) => {
    if (mapRef.current) {
      mapRef.current.flyTo([report.coords.lng, report.coords.lat], 16);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <BaseMap
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="w-full h-full rounded-xl overflow-hidden"
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      )}

      {/* Reports count */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{reports.length} Reports</span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs">Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-xs">🚨 Urgent</span>
          </div>
        </div>
      </div>

      {/* Selected report info */}
      {selectedReport && (
        <Card className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getStatusColor(selectedReport.status, selectedReport.priority)} text-white`}>
                  {selectedReport.status.toUpperCase()}
                </Badge>
                {selectedReport.priority === 'redflag' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-sm font-medium line-clamp-2 mb-1">
                {selectedReport.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {selectedReport.reportedAt ? 
                    (selectedReport.reportedAt.toDate ? selectedReport.reportedAt.toDate().toLocaleDateString() : 'Date unavailable') :
                    'Date unavailable'
                  }
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateToReport(selectedReport)}
              >
                <Navigation className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => onReportClick?.(selectedReport)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Custom styles for markers */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .report-marker.urgent {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          .maplibregl-popup-content {
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
        `
      }} />
    </div>
  );
};
