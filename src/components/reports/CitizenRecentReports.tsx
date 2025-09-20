import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Camera,
  Image as ImageIcon,
  X,
  Trash2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { formatCoordinates } from '@/utils/geoUtils';
import { getImageForViewing } from '@/utils/imageUtils';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  description: string;
  reporterId: string;
  imageUrl?: string; // Optional since we removed image upload
  coords: { lat: number; lng: number };
  reportedAt: Timestamp;
  status: 'open' | 'assigned' | 'collected' | 'approved' | 'rejected';
  priority: 'normal' | 'redflag';
  collectedAt?: Timestamp;
  approvedAt?: Timestamp;
  driverId?: string;
  rejectionReason?: string;
  imageId?: string;
  hasImage?: boolean;
}

interface CitizenRecentReportsProps {
  className?: string;
}

export const CitizenRecentReports = ({ className }: CitizenRecentReportsProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());

  // Listen to user's reports
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    // Temporary fix: Query without orderBy to avoid index requirement
    // TODO: Remove this workaround after creating the Firestore index
    const reportsQuery = query(
      collection(db, 'reports'),
      where('reporterId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      
      // Client-side sorting to replace server-side orderBy
      // TODO: Remove this after creating the Firestore index
      const sortedReports = reportsData.sort((a, b) => {
        if (!a.reportedAt) return 1;
        if (!b.reportedAt) return -1;
        
        const dateA = a.reportedAt.toDate ? a.reportedAt.toDate() : new Date(a.reportedAt);
        const dateB = b.reportedAt.toDate ? b.reportedAt.toDate() : new Date(b.reportedAt);
        
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
      });
      
      setReports(sortedReports);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching reports:', error);
      
      // If it's an index error, show a helpful message
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        toast({
          title: "Database Index Required",
          description: "Setting up database optimizations. Please wait a moment and refresh.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Error Loading Reports",
          description: "Unable to load your reports. Please try again.",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Load images for reports that have them
  useEffect(() => {
    const loadImages = async () => {
      const newImageUrls = new Map<string, string>();
      
      for (const report of reports) {
        if (report.hasImage && report.imageId) {
          try {
            const imageUrl = await getImageForViewing(report.imageId);
            if (imageUrl) {
              newImageUrls.set(report.id, imageUrl);
            }
          } catch (error) {
            console.error(`Error loading image for report ${report.id}:`, error);
          }
        }
      }
      
      setImageUrls(newImageUrls);
    };

    if (reports.length > 0) {
      loadImages();
    }

    // Cleanup URLs on unmount
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [reports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'assigned': return 'bg-yellow-500';
      case 'collected': return 'bg-orange-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'assigned': return 'Assigned to Driver';
      case 'collected': return 'Awaiting Your Approval';
      case 'approved': return 'Approved & Complete';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleApproveCollection = async (reportId: string, approve: boolean) => {
    setIsApproving(true);
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: approve ? 'approved' : 'rejected',
        approvedAt: approve ? new Date() : null,
        rejectionReason: approve ? null : 'Citizen reported issue not resolved'
      });

      toast({
        title: approve ? "Collection approved" : "Collection rejected",
        description: approve 
          ? "Thank you for confirming the cleanup!"
          : "The driver will be notified to revisit this location",
      });

      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Update failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeleteReport = async (reportId: string, reportHasImage: boolean, imageId?: string) => {
    setIsDeleting(reportId);
    try {
      // Delete the report from Firestore
      const reportRef = doc(db, 'reports', reportId);
      await deleteDoc(reportRef);

      // If the report has an image, dispose it from local storage
      if (reportHasImage && imageId) {
        try {
          const { disposeImageAfterApproval } = await import('@/utils/imageUtils');
          await disposeImageAfterApproval(imageId);
          console.log(`📸 Image ${imageId} disposed after report deletion`);
        } catch (imageError) {
          console.warn('Could not dispose image:', imageError);
          // Don't fail the deletion if image disposal fails
        }
      }

      // Remove image URL from local state
      const newImageUrls = new Map(imageUrls);
      newImageUrls.delete(reportId);
      setImageUrls(newImageUrls);

      toast({
        title: "Report deleted",
        description: "Your report has been successfully deleted",
      });

      // Close modal if it was open
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }

    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Deletion failed",
        description: "Unable to delete report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'Date unavailable';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading your reports...
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={`p-6 shadow-depth hover:shadow-premium transition-all duration-300 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-hero text-primary-foreground shadow-glow">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground tracking-tight">
              Your Recent Reports
            </h2>
            <p className="text-sm text-muted-foreground">
              Track your community contributions
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No reports yet</p>
            <p className="text-sm text-muted-foreground">
              Submit your first report to help keep the community clean!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 border border-border rounded-xl hover:shadow-inner transition-all duration-300 cursor-pointer group relative"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start gap-4">
                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(report.status)} group-hover:scale-110 transition-transform`} />
                  </div>

                  {/* Report Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {report.hasImage && (
                          <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                            <Camera className="h-3 w-3" />
                            <span>Photo</span>
                          </div>
                        )}
                        {report.priority === 'redflag' && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Image thumbnail if available */}
                    {report.hasImage && imageUrls.get(report.id) && (
                      <div className="mb-3">
                        <img
                          src={imageUrls.get(report.id)}
                          alt="Report photo"
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {formatCoordinates(report.coords.lat, report.coords.lng, 4)}
                      </span>
                      <span>{formatDate(report.reportedAt)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(report.status)} text-white`}
                      >
                        {getStatusText(report.status)}
                      </Badge>

                      {report.status === 'collected' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-600 font-medium">Action Required</span>
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}
                      className="hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReport(report.id, report.hasImage || false, report.imageId);
                      }}
                      disabled={isDeleting === report.id}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      {isDeleting === report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Report Details Modal */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Report Details
                {selectedReport.priority === 'redflag' && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(selectedReport.status)} text-white px-3 py-1`}>
                  {getStatusText(selectedReport.status)}
                </Badge>
                {selectedReport.priority === 'redflag' && (
                  <Badge variant="destructive" className="px-3 py-1">
                    🚨 Urgent
                  </Badge>
                )}
              </div>

              {/* Image display */}
              {selectedReport.hasImage && imageUrls.get(selectedReport.id) ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={imageUrls.get(selectedReport.id)} 
                    alt="Report photo"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary/80 text-white border-0">
                      <Camera className="h-3 w-3 mr-1" />
                      Geotagged Photo
                    </Badge>
                  </div>
                </div>
              ) : selectedReport.hasImage ? (
                <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading photo...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-muted/50 to-muted rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                  <div className="text-center space-y-2">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">Location-based Report</p>
                    <p className="text-xs text-muted-foreground/60">No photo attached</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-mono">
                    {formatCoordinates(selectedReport.coords.lat, selectedReport.coords.lng)}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Reported: {formatDate(selectedReport.reportedAt)}</span>
                  </div>
                  {selectedReport.collectedAt && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span>Collected: {formatDate(selectedReport.collectedAt)}</span>
                    </div>
                  )}
                  {selectedReport.approvedAt && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Approved: {formatDate(selectedReport.approvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Actions */}
              {selectedReport.status === 'collected' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-amber-800 text-sm font-medium">
                      🚛 Driver has marked this issue as collected
                    </p>
                    <p className="text-amber-700 text-xs mt-1">
                      Please confirm if the issue has been resolved
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproveCollection(selectedReport.id, true)}
                      disabled={isApproving}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isApproving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ThumbsUp className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleApproveCollection(selectedReport.id, false)}
                      disabled={isApproving}
                      variant="destructive"
                      className="flex-1"
                    >
                      {isApproving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {selectedReport.status === 'rejected' && selectedReport.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">Rejection Reason</p>
                  <p className="text-red-700 text-sm mt-1">{selectedReport.rejectionReason}</p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteReport(selectedReport.id, selectedReport.hasImage || false, selectedReport.imageId);
                  }}
                  disabled={isDeleting === selectedReport.id}
                  className="gap-2"
                >
                  {isDeleting === selectedReport.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
