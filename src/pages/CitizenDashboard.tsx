import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { CitizenReportForm } from "@/components/reports/CitizenReportForm";
import { CitizenRecentReports } from "@/components/reports/CitizenRecentReports";
import { CitizenApprovalSystem } from "@/components/reports/CitizenApprovalSystem";
import { ReportsMap } from "@/components/maps/ReportsMap";
import { ReportingStepsCarousel } from "@/components/carousel/ReportingStepsCarousel";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const CitizenDashboard = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [showCarousel, setShowCarousel] = useState(false);



  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navbar */}
      <Navbar showBackToHome={true} />

      <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">

        {/* Reporting Steps Carousel */}
        {showCarousel && (
          <div className="animate-fade-in-up">
            <ReportingStepsCarousel 
              onStartReporting={() => setShowCarousel(false)}
              className="mb-8"
            />
          </div>
        )}

        {/* Show Carousel Button */}
        {!showCarousel && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowCarousel(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-hero text-white font-semibold rounded-xl shadow-premium hover:shadow-glow transition-all duration-300"
            >
              📋 Learn How to Report Issues
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* New Report Form */}
          <CitizenReportForm 
            onSuccess={() => {
              toast({
                title: "Report submitted!",
                description: "Thank you for helping keep our community clean",
              });
            }}
            onShowSteps={() => setShowCarousel(true)}
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.3s' } as any}
          />

          {/* Reports Map */}
          <Card className="p-6 sm:p-8 shadow-depth hover:shadow-premium transition-all duration-300 animate-fade-in-up border-0 bg-gradient-card" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-hero text-primary-foreground shadow-glow">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight leading-tight">Your Reports Map</h2>
            </div>
            
            <div className="h-80 sm:h-96 lg:h-[500px]">
              <ReportsMap
                showUserReportsOnly={true}
                userId={currentUser?.uid}
                className="w-full h-full"
                onReportClick={(report) => {
                  toast({
                    title: "Report Details",
                    description: `Status: ${report.status.toUpperCase()}`,
                  });
                }}
              />
            </div>
          </Card>
        </div>

        {/* Approval System */}
        <CitizenApprovalSystem 
          className="animate-fade-in-up" 
        />

        {/* Recent Reports */}
        <CitizenRecentReports 
          className="animate-fade-in-up" 
          style={{ animationDelay: '0.5s' } as any}
        />
      </div>
    </div>
  );
};

export default CitizenDashboard;