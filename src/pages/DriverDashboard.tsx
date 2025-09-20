import { useState, useEffect } from "react";
import { MapPin, CheckCircle, AlertCircle, Trophy, Truck, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { DriverReportsList } from "@/components/reports/DriverReportsList";
import DriverRouteDisplay from "@/components/driver/DriverRouteDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getDriverOptimizedLocations, generateGoogleMapsRoute, updateDriverReportAssignments } from '@/services/driverRouteService';
import { autoSetupDriverForOptimization, checkDriverLocationData, logDriverCheckIn, logDriverCheckOut } from '@/services/driverLocationService';

interface PriorityReport {
  id: string;
  description: string;
  reporterId: string;
  coords: { lat: number; lng: number };
  reportedAt: Timestamp;
  status: 'open' | 'assigned' | 'collected' | 'approved' | 'rejected';
  priority: 'normal' | 'redflag';
  driverId?: string;
}

const DriverDashboard = () => {
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [activeTab, setActiveTab] = useState<'assigned' | 'available'>('assigned');
  const [driverStats, setDriverStats] = useState({
    tasksToday: 0,
    completed: 0,
    pending: 0,
    pointsToday: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [driverRouteData, setDriverRouteData] = useState(null);
  const [showDriverRoute, setShowDriverRoute] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [driverLocationStatus, setDriverLocationStatus] = useState(null);
  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();


  const handleCheckIn = async () => {
    if (!isOnDuty) {
      // Driver is checking IN - capture location
      setIsCapturingLocation(true);
      try {
        if (!userProfile?.driverId) {
          toast({
            title: "Driver profile not linked",
            description: "Your user is not linked to a driverId. Please ask admin to link your driver profile.",
            variant: "destructive",
          });
          return;
        }
        const driverId = userProfile.driverId;
        const driverName = userProfile?.name || userProfile?.displayName || 'Driver';
        
        console.log('📍 Capturing driver location for check-in...');
        
        // Only log check-in (no location capture)
        try {
          await logDriverCheckIn(driverId, null);
        } catch {}

        {
          setIsOnDuty(true);
          setDriverLocationStatus({
            hasLocation: true,
            message: 'Checked in successfully'
          });
          
          toast({
            title: "Checked in successfully!",
            description: `Your status is now On Duty`,
          });
        }
      } catch (error) {
        console.error('❌ Failed to capture location:', error);
        toast({
          title: "Location capture failed",
          description: error.message || "Please allow location access and try again",
          variant: "destructive",
        });
      } finally {
        setIsCapturingLocation(false);
      }
    } else {
      // Driver is checking OUT
      // Cloud check-out record
      if (userProfile?.driverId) {
        try { await logDriverCheckOut(userProfile.driverId); } catch {}
      }
      setIsOnDuty(false);
      setDriverLocationStatus(null);
      toast({
        title: "Checked out successfully",
        description: "Have a great day!",
      });
    }
  };

  const handleGetMyRoute = async () => {
    if (!userProfile?.driverId) {
      toast({
        title: "Driver ID not found",
        description: "Please make sure you're logged in as a driver",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      console.log('🚛 Getting driver-specific route for:', userProfile.driverId);
      const routeData = await getDriverOptimizedLocations(userProfile.driverId);
      setDriverRouteData(routeData);
      setShowDriverRoute(true);
      toast({
        title: "Route assigned successfully! 🎉",
        description: `You have ${routeData.total_locations} locations assigned to you`,
      });
    } catch (error) {
      console.error('Failed to get driver route:', error);
      toast({
        title: "Failed to get your route",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!driverRouteData || !userProfile?.driverId) return;
    
    setIsAssigning(true);
    try {
      await updateDriverReportAssignments(userProfile.driverId, driverRouteData.assigned_locations);
      toast({
        title: "Assignment confirmed! ✅",
        description: "Your route has been confirmed and reports are now assigned to you",
      });
      setShowDriverRoute(false);
      setDriverRouteData(null);
    } catch (error) {
      console.error('Failed to confirm assignment:', error);
      toast({
        title: "Failed to confirm assignment",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Check driver location status on component load
  useEffect(() => {
    const checkDriverStatus = async () => {
      if (!userProfile?.driverId) {
        setIsLoadingStats(false);
        return;
      }
      
      try {
        const driverId = userProfile.driverId;
        const status = await checkDriverLocationData(driverId);
        setDriverLocationStatus(status);
        console.log('📍 Driver location status:', status);
      } catch (error) {
        console.error('❌ Failed to check driver status:', error);
      }
    };
    
    checkDriverStatus();
  }, [userProfile?.driverId]);

  // Listen to driver's reports for real-time statistics
  useEffect(() => {
    if (!userProfile?.driverId) {
      setIsLoadingStats(false);
      return;
    }

    console.log('🔍 Setting up driver stats listener for:', userProfile.driverId);
    
    const driverReportsQuery = query(
      collection(db, 'reports'),
      where('driverId', '==', userProfile.driverId)
    );

    const unsubscribe = onSnapshot(driverReportsQuery, (snapshot) => {
      console.log('📊 Driver reports snapshot received:', snapshot.size, 'reports');
      
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PriorityReport[];

      // Calculate today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Filter reports for today
      const todayReports = reports.filter(report => {
        if (!report.reportedAt) return false;
        const reportDate = report.reportedAt.toDate ? report.reportedAt.toDate() : new Date(report.reportedAt);
        return reportDate >= today && reportDate < tomorrow;
      });
      
      // Calculate statistics
      const completed = reports.filter(r => r.status === 'approved' || r.status === 'collected').length;
      const completedToday = todayReports.filter(r => r.status === 'approved' || r.status === 'collected').length;
      const pending = reports.filter(r => r.status === 'assigned').length;
      
      // For demonstration purposes, if no real data exists, show demo data
      // In production, this would show real data from the database
      const hasRealData = reports.length > 0;
      
      const stats = hasRealData ? {
        tasksToday: todayReports.length,
        completed: completed,
        pending: pending,
        pointsToday: completedToday * 25 // 25 points per completed task
      } : {
        // Demo data for testing/demonstration
        tasksToday: 15,
        completed: 12,
        pending: 3,
        pointsToday: 850
      };
      
      console.log('📈 Calculated driver stats:', stats, hasRealData ? '(real data)' : '(demo data)');
      setDriverStats(stats);
      setIsUsingDemoData(!hasRealData);
      setIsLoadingStats(false);
    }, (error) => {
      console.error('❌ Error fetching driver stats:', error);
      
      // Show demo data on error for better UX
      setDriverStats({
        tasksToday: 15,
        completed: 12,
        pending: 3,
        pointsToday: 850
      });
      setIsUsingDemoData(true);
      setIsLoadingStats(false);
    });

    return unsubscribe;
  }, [userProfile?.driverId]);


  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navbar */}
      <Navbar showBackToHome={true} />

      <div className="container mx-auto p-4 space-y-4 sm:space-y-6">
        {/* Driver Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-hero text-primary-foreground">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Driver Status</h2>
              <p className="text-sm text-muted-foreground">
                {isOnDuty ? "Currently on duty" : "Off duty"}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleCheckIn}
            disabled={isCapturingLocation}
            variant={isOnDuty ? "outline" : "default"}
            className={`px-6 py-3 rounded-xl font-display font-semibold transition-all duration-300 ${
              isOnDuty ? "hover:shadow-glow" : "bg-gradient-hero shadow-premium hover:shadow-glow hover:scale-105"
            } ${isCapturingLocation ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isCapturingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Capturing Location...
              </>
            ) : isOnDuty ? (
              "Check Out"
            ) : (
              "Check In"
            )}
          </Button>
        </div>

        {/* Location Status Indicator */}
        {driverLocationStatus && (
          <div className={`border rounded-lg p-3 mb-4 ${
            driverLocationStatus.hasAllRequiredFields 
              ? "bg-green-50 border-green-200" 
              : "bg-orange-50 border-orange-200"
          }`}>
            <div className="flex items-center gap-2">
              {driverLocationStatus.hasAllRequiredFields ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
              <p className={`text-sm ${
                driverLocationStatus.hasAllRequiredFields 
                  ? "text-green-700" 
                  : "text-orange-700"
              }`}>
                <span className="font-medium">
                  {driverLocationStatus.hasAllRequiredFields 
                    ? "✅ Ready for Route Optimization" 
                    : "📍 Location Required"}
                </span>
                {driverLocationStatus.hasAllRequiredFields 
                  ? " Your location is captured and you're ready for route optimization."
                  : " Check in to automatically capture your location for route optimization."
                }
              </p>
            </div>
              </div>
        )}

        {/* Demo Data Indicator */}
        {isUsingDemoData && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-700">
                <span className="font-medium">Demo Mode:</span> Showing sample data. In production, these would be your actual task statistics.
              </p>
            </div>
          </div>
        )}
          
        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-6 bg-gradient-eco text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-primary-foreground/80">Collected Today</p>
                {isLoadingStats ? (
                  <div className="animate-pulse bg-primary-foreground/20 h-6 w-8 rounded mt-1"></div>
                ) : (
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{driverStats.completed}</p>
                )}
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/80">Pending Issues</p>
                {isLoadingStats ? (
                  <div className="animate-pulse bg-white/20 h-6 w-8 rounded mt-1"></div>
                ) : (
                  <p className="text-lg sm:text-xl md:text-2xl font-bold">{driverStats.pending}</p>
                )}
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/80">Your Points</p>
                {isLoadingStats ? (
                  <div className="animate-pulse bg-white/20 h-6 w-12 rounded mt-1"></div>
                ) : (
                  <p className="text-lg sm:text-xl md:text-2xl font-bold">{driverStats.pointsToday}</p>
                )}
              </div>
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
          </Card>
        </div>

        {/* Route Optimization Section */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Route className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Smart Route Optimization</h3>
                <p className="text-sm text-white/80">
                  Optimize collection routes using AI for maximum efficiency
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {driverLocationStatus && !driverLocationStatus.hasAllRequiredFields && (
                <Button
                  onClick={async () => {
                    setIsCapturingLocation(true);
                    try {
                      if (!userProfile?.driverId) {
                        toast({
                          title: "Driver profile not linked",
                          description: "Your user is not linked to a driverId. Please ask admin to link your driver profile.",
                          variant: "destructive",
                        });
                        return;
                      }
                      const driverId = userProfile.driverId;
                      const result = await autoSetupDriverForOptimization(driverId);
                      if (result.success) {
                        setDriverLocationStatus({
                          hasLocation: true,
                          hasAllRequiredFields: true,
                          message: 'Location updated successfully'
                        });
                        toast({
                          title: "Location updated! 📍",
                          description: "You're now ready for route optimization",
                        });
                      } else {
                        throw new Error(result.message);
                      }
                    } catch (error) {
                      toast({
                        title: "Location update failed",
                        description: error.message,
                        variant: "destructive",
                      });
                    } finally {
                      setIsCapturingLocation(false);
                    }
                  }}
                  disabled={isCapturingLocation}
                        variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold px-4 py-2 rounded-lg"
                >
                  {isCapturingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Update Location
                    </>
                  )}
                        </Button>
                      )}
                        <Button 
                onClick={handleGetMyRoute}
                disabled={isOptimizing || (driverLocationStatus && !driverLocationStatus.hasAllRequiredFields)}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                    Getting Your Route...
                  </>
                ) : (
                  <>
                    <Route className="h-4 w-4 mr-2" />
                    Get My Route
                  </>
                )}
                        </Button>
                    </div>
                  </div>
          </Card>

        {/* Driver Route Display */}
        {showDriverRoute && (
          <div className="space-y-6">
            <DriverRouteDisplay 
              routeData={driverRouteData}
              onAssignRoutes={handleConfirmAssignment}
              isAssigning={isAssigning}
            />
          </div>
        )}

        {/* Reports Section */}
        <div className="space-y-6">
          {/* Reports Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant={activeTab === 'assigned' ? 'default' : 'outline'}
              onClick={() => setActiveTab('assigned')}
              className="flex-1 justify-center sm:justify-start text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
            >
              <Truck className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">My Assigned Reports</span>
            </Button>
            <Button
              variant={activeTab === 'available' ? 'default' : 'outline'}
              onClick={() => setActiveTab('available')}
              className="flex-1 justify-center sm:justify-start text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
            >
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Available Reports</span>
            </Button>
          </div>

          {/* Reports List */}
          {activeTab === 'assigned' ? (
            <DriverReportsList 
              driverId={userProfile?.driverId || currentUser?.uid}
              showAllReports={false}
            />
          ) : (
            <DriverReportsList 
              driverId={userProfile?.driverId || currentUser?.uid}
              showAllReports={true}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default DriverDashboard;