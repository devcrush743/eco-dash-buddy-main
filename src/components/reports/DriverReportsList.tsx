import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ImageViewer } from '@/components/images/ImageViewer';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  User,
  Camera,
  Navigation,
  Truck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatCoordinates } from '@/utils/geoUtils';

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
  imageId?: string;
  hasImage?: boolean;
}

interface DriverReportsListProps {
  driverId?: string;
  showAllReports?: boolean;
  className?: string;
}

export const DriverReportsList = ({ 
  driverId, 
  showAllReports = false,
  className 
}: DriverReportsListProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  // Listen to reports from Firestore
  useEffect(() => {
    console.log('🔍 DriverReportsList useEffect triggered:', { driverId, showAllReports });
    
    let reportsQuery;
    
    if (showAllReports) {
      // Show all open reports for assignment
      console.log('📋 Querying all available reports (open/assigned)');
      reportsQuery = query(
        collection(db, 'reports'),
        where('status', 'in', ['open', 'assigned'])
        // Removed orderBy to avoid Firestore index issues
      );
    } else if (driverId) {
      // Show reports assigned to this driver
      console.log('📋 Querying reports assigned to driver:', driverId);
      reportsQuery = query(
        collection(db, 'reports'),
        where('driverId', '==', driverId)
        // Removed orderBy to avoid Firestore index issues
      );
    } else {
      console.log('❌ No valid query parameters provided');
      setIsLoading(false);
      return; // No valid query
    }

    console.log('🔍 Setting up Firestore listener for reports');
    
    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      console.log('📊 Firestore snapshot received:', snapshot.size, 'documents');
      
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      
      // Sort client-side to avoid index issues
      reportsData.sort((a, b) => {
        const aTime = a.reportedAt?.toDate?.() || new Date(0);
        const bTime = b.reportedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      console.log('✅ Reports loaded:', reportsData.length, 'reports');
      console.log('📝 Report details:', reportsData.map(r => ({ 
        id: r.id, 
        status: r.status, 
        driverId: r.driverId,
        description: r.description.substring(0, 50) + '...'
      })));
      
      setReports(reportsData);
      setIsLoading(false);
    }, (error) => {
      console.error('❌ Error fetching driver reports:', error);
      toast({
        title: "Error Loading Reports",
        description: `Unable to load reports: ${error.message}`,
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [driverId, showAllReports, toast]);

  // Assign report to driver
  const handleAssignReport = async (reportId: string) => {
    if (!driverId) return;
    
    setIsUpdating(reportId);
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: 'assigned',
        driverId: driverId,
        assignedAt: new Date()
      });

      toast({
        title: "Report Assigned",
        description: "Report has been assigned to you successfully.",
      });
    } catch (error) {
      console.error('Error assigning report:', error);
      toast({
        title: "Assignment Failed",
        description: "Unable to assign report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Mark report as collected
  const handleMarkCollected = async (reportId: string) => {
    setIsUpdating(reportId);
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: 'collected',
        collectedAt: new Date()
      });

      toast({
        title: "Report Marked as Collected",
        description: "Waiting for citizen approval.",
      });
    } catch (error) {
      console.error('Error marking report as collected:', error);
      toast({
        title: "Update Failed",
        description: "Unable to update report status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusColor = (status: string, priority: string) => {
    if (priority === 'redflag') return 'bg-red-600 text-white';
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'assigned': return 'bg-yellow-500 text-white';
      case 'collected': return 'bg-orange-500 text-white';
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'assigned': return <Truck className="h-4 w-4" />;
      case 'collected': return <CheckCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground ml-3">Loading reports...</p>
        </div>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Truck className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold text-muted-foreground">
              {showAllReports ? 'No Available Reports' : 'No Assigned Reports'}
            </p>
            <p className="text-sm text-muted-foreground">
              {showAllReports 
                ? 'All reports have been assigned or completed' 
                : 'You have no reports assigned to you at the moment'
              }
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reports.map((report) => (
        <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(report.status, report.priority)}>
                    {getStatusIcon(report.status)}
                    <span className="ml-1">{report.status.toUpperCase()}</span>
                  </Badge>
                  {report.priority === 'redflag' && (
                    <Badge variant="destructive" className="bg-red-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      URGENT
                    </Badge>
                  )}
                  {(report.hasImage || report.imageId) && (
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      <Camera className="h-3 w-3 mr-1" />
                      Photo Available
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm font-medium leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="font-mono text-xs">
                  {formatCoordinates(report.coords.lat, report.coords.lng, 3)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  {report.reportedAt ? 
                    formatDistanceToNow(
                      report.reportedAt.toDate ? report.reportedAt.toDate() : new Date(report.reportedAt), 
                      { addSuffix: true }
                    ) : 
                    'Date unavailable'
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 flex-shrink-0" />
                <span>Citizen Report</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(report)}
                className={`${(report.hasImage || report.imageId) ? 'border-blue-200 text-blue-700 hover:bg-blue-50' : ''}`}
              >
                {(report.hasImage || report.imageId) && <Camera className="h-3 w-3 mr-1" />}
                View Details
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://maps.google.com/maps?q=${report.coords.lat},${report.coords.lng}`;
                  window.open(url, '_blank');
                }}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Navigate
              </Button>

              {/* Status-specific actions */}
              {report.status === 'open' && showAllReports && driverId && (
                <Button
                  size="sm"
                  onClick={() => handleAssignReport(report.id)}
                  disabled={isUpdating === report.id}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isUpdating === report.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4 mr-1" />
                      Assign to Me
                    </>
                  )}
                </Button>
              )}

              {report.status === 'assigned' && report.driverId === driverId && (
                <Button
                  size="sm"
                  onClick={() => handleMarkCollected(report.id)}
                  disabled={isUpdating === report.id}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isUpdating === report.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Collected
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Report Details
              {selectedReport?.priority === 'redflag' && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  URGENT
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Report Description</h4>
                    <p className="text-sm leading-relaxed p-3 bg-muted rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Status Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Current Status:</span>
                        <Badge className={getStatusColor(selectedReport.status, selectedReport.priority)}>
                          {selectedReport.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority Level:</span>
                        <Badge variant={selectedReport.priority === 'redflag' ? 'destructive' : 'outline'}>
                          {selectedReport.priority === 'redflag' ? 'URGENT' : 'NORMAL'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Reported:</span>
                        <span>
                          {selectedReport.reportedAt ? 
                            (selectedReport.reportedAt.toDate ? selectedReport.reportedAt.toDate().toLocaleString() : new Date(selectedReport.reportedAt).toLocaleString()) :
                            'Date unavailable'
                          }
                        </span>
                      </div>
                      {selectedReport.collectedAt && (
                        <div className="flex justify-between">
                          <span>Collected:</span>
                          <span>
                            {selectedReport.collectedAt.toDate ? selectedReport.collectedAt.toDate().toLocaleString() : new Date(selectedReport.collectedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Location Details</h4>
                    <div className="space-y-2 text-sm p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-mono">
                          {formatCoordinates(selectedReport.coords.lat, selectedReport.coords.lng, 5)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = `https://maps.google.com/maps?q=${selectedReport.coords.lat},${selectedReport.coords.lng}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full mt-2"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Open in Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Evidence */}
              {(selectedReport.hasImage || selectedReport.imageId) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Photo Evidence from Citizen
                  </h4>
                  <ImageViewer
                    reportId={selectedReport.id}
                    reportStatus={selectedReport.status}
                    reportPriority={selectedReport.priority}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedReport.status === 'open' && showAllReports && driverId && (
                  <Button
                    onClick={() => {
                      handleAssignReport(selectedReport.id);
                      setSelectedReport(null);
                    }}
                    disabled={isUpdating === selectedReport.id}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Truck className="h-4 w-4 mr-1" />
                    Assign to Me
                  </Button>
                )}

                {selectedReport.status === 'assigned' && selectedReport.driverId === driverId && (
                  <Button
                    onClick={() => {
                      handleMarkCollected(selectedReport.id);
                      setSelectedReport(null);
                    }}
                    disabled={isUpdating === selectedReport.id}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as Collected
                  </Button>
                )}

                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
