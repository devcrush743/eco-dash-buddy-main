import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ImageViewer } from '@/components/images/ImageViewer';
import { disposeImageAfterApproval } from '@/utils/imageUtils';
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
  CheckCircle, 
  X, 
  Clock, 
  AlertTriangle,
  MapPin,
  Calendar,
  Truck,
  ThumbsUp,
  ThumbsDown,
  Camera
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

interface CitizenApprovalSystemProps {
  className?: string;
}

export const CitizenApprovalSystem = ({ className }: CitizenApprovalSystemProps) => {
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Listen to reports awaiting citizen approval
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    console.log('🔍 Setting up approval system listener for user:', currentUser.uid);

    const reportsQuery = query(
      collection(db, 'reports'),
      where('reporterId', '==', currentUser.uid),
      where('status', '==', 'collected')
      // Removed orderBy to avoid index issues
    );

    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      console.log('📊 Approval system snapshot received:', snapshot.size, 'reports awaiting approval');
      
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      
      // Sort client-side to avoid index issues
      reportsData.sort((a, b) => {
        const aTime = a.collectedAt?.toDate?.() || (a.collectedAt?.seconds ? new Date(a.collectedAt.seconds * 1000) : new Date(0));
        const bTime = b.collectedAt?.toDate?.() || (b.collectedAt?.seconds ? new Date(b.collectedAt.seconds * 1000) : new Date(0));
        return bTime.getTime() - aTime.getTime();
      });
      
      console.log('✅ Approval reports loaded:', reportsData.length, 'pending approvals');
      setPendingReports(reportsData);
      setIsLoading(false);
    }, (error) => {
      console.error('❌ Error fetching pending approvals:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // More specific error handling
      let errorMessage = "Unable to load pending approvals. Please try again.";
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check your account access.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      }
      
      toast({
        title: "Error Loading Approvals",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [currentUser, toast]);

  // Approve collection
  const handleApproval = async (reportId: string, approved: boolean) => {
    setIsUpdating(reportId);
    
    try {
      const reportRef = doc(db, 'reports', reportId);
      const updateData = {
        status: approved ? 'approved' : 'rejected',
        approvedAt: new Date(),
        approvedBy: currentUser?.uid
      };

      await updateDoc(reportRef, updateData);

      // Dispose image if approved
      const report = pendingReports.find(r => r.id === reportId);
      if (approved && report?.imageId) {
        try {
          await disposeImageAfterApproval(report.imageId);
          console.log(`📸 Image disposed after approval for report ${reportId}`);
        } catch (imageError) {
          console.warn('Could not dispose image:', imageError);
          // Don't fail the approval if image disposal fails
        }
      }

      toast({
        title: approved ? "Collection Approved" : "Collection Rejected",
        description: approved 
          ? "Thank you for confirming the waste was collected!" 
          : "The driver will be notified to complete the collection.",
        variant: approved ? "default" : "destructive",
      });

      // Close dialog if it was open
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }

    } catch (error) {
      console.error('Error updating approval status:', error);
      toast({
        title: "Update Failed",
        description: "Unable to update approval status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground ml-3">Loading approvals...</p>
        </div>
      </Card>
    );
  }

  if (pendingReports.length === 0) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-muted-foreground">All Caught Up!</p>
            <p className="text-sm text-muted-foreground">
              No collections waiting for your approval
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-semibold">Pending Approvals</h3>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          {pendingReports.length} waiting
        </Badge>
      </div>

      {pendingReports.map((report) => (
        <Card key={report.id} className="p-6 border-orange-200 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    AWAITING APPROVAL
                  </Badge>
                  {report.priority === 'redflag' && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      URGENT
                    </Badge>
                  )}
                  {report.hasImage && (
                    <Badge variant="outline">
                      <Camera className="h-3 w-3 mr-1" />
                      Photo
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm font-medium leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>

            {/* Collection Details */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Collection Completed</span>
              </div>
              <div className="text-xs text-orange-700">
                Collected {report.collectedAt && formatDistanceToNow(
                  report.collectedAt.toDate ? report.collectedAt.toDate() : new Date(report.collectedAt.seconds * 1000), 
                  { addSuffix: true }
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="font-mono text-xs">
                  {formatCoordinates(report.coords.lat, report.coords.lng, 3)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  Reported {report.reportedAt ? 
                    formatDistanceToNow(
                      report.reportedAt.toDate ? report.reportedAt.toDate() : new Date(report.reportedAt.seconds * 1000), 
                      { addSuffix: true }
                    ) : 
                    'Date unavailable'
                  }
                </span>
              </div>
            </div>

            {/* Approval Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(report)}
              >
                View Details
              </Button>

              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApproval(report.id, false)}
                  disabled={isUpdating === report.id}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  {isUpdating === report.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <>
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Reject
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleApproval(report.id, true)}
                  disabled={isUpdating === report.id}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isUpdating === report.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick approval note */}
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <strong>Please verify:</strong> Has the waste been properly collected from this location? 
              Your approval helps maintain service quality and driver accountability.
            </div>
          </div>
        </Card>
      ))}

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Collection Approval Required
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Original Report</h4>
                    <p className="text-sm leading-relaxed p-3 bg-muted rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Collection Status</h4>
                    <div className="space-y-2 text-sm p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800 font-medium">
                        <Truck className="h-4 w-4" />
                        Driver marked as collected
                      </div>
                      <div className="text-orange-700">
                        {selectedReport.collectedAt && 
                          `Completed ${selectedReport.collectedAt ? 
                            (selectedReport.collectedAt.toDate ? selectedReport.collectedAt.toDate().toLocaleString() : new Date(selectedReport.collectedAt.seconds * 1000).toLocaleString()) :
                            'Date unavailable'
                          }`
                        }
                      </div>
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
                        <MapPin className="h-4 w-4 mr-1" />
                        View Location
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Evidence */}
              {selectedReport.hasImage && selectedReport.imageId && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Original Photo Evidence</h4>
                  <ImageViewer
                    reportId={selectedReport.id}
                    reportStatus={selectedReport.status}
                    reportPriority={selectedReport.priority}
                  />
                </div>
              )}

              {/* Approval Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <strong>Verification:</strong> Please confirm if the waste has been properly collected from this location.
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleApproval(selectedReport.id, false);
                    }}
                    disabled={isUpdating === selectedReport.id}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Reject Collection
                  </Button>

                  <Button
                    onClick={() => {
                      handleApproval(selectedReport.id, true);
                    }}
                    disabled={isUpdating === selectedReport.id}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Approve Collection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
