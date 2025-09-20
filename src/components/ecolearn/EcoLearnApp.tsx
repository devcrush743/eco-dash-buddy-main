import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { LearningModule } from './LearningModule';
import { ProgressTracker } from './ProgressTracker';
import { Certificate } from './Certificate';
import { WasteCollectionDashboard } from './WasteCollectionDashboard';
import { BinManagement } from './BinManagement';
import { VehicleTracking } from './VehicleTracking';
import { SchedulingEngine } from './SchedulingEngine';
import { BulkWasteManagement } from './BulkWasteManagement';
import { GreenChampionsDashboard } from './GreenChampionsDashboard';
import { ChampionsManagement } from './ChampionsManagement';
import { ComplianceMonitoring } from './ComplianceMonitoring';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { FacilityManagementDashboard } from './FacilityManagementDashboard';
import { FacilityDirectory } from './FacilityDirectory';
import { RecyclingCenters } from './RecyclingCenters';
import { ScrapBookingSystem } from './ScrapBookingSystem';
import { WTEMonitoring } from './WTEMonitoring';
import { CapacityMonitoring } from './CapacityMonitoring';
import { LanguageProvider, useLanguage } from '../../contexts/ecolearn/LanguageContext';
import { ProgressProvider } from '../../contexts/ecolearn/ProgressContext';
import { WasteCollectionProvider } from '../../contexts/ecolearn/WasteCollectionContext';
import { GreenChampionsProvider } from '../../contexts/ecolearn/GreenChampionsContext';
import { AnalyticsProvider } from '../../contexts/ecolearn/AnalyticsContext';
import { FacilityProvider } from '../../contexts/ecolearn/FacilityContext';
import { UserProvider } from '../../contexts/ecolearn/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ViewType = 'dashboard' | 'module' | 'progress' | 'certificate' | 'waste-collection' | 'bin-management' | 'vehicle-tracking' | 'scheduling' | 'bulk-waste' | 'green-champions' | 'champions-management' | 'compliance-monitoring' | 'analytics' | 'facility-management' | 'facility-directory' | 'recycling-centers' | 'scrap-booking' | 'wte-monitoring' | 'capacity-monitoring';

function EcoLearnContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Map user types to EcoLearn roles
  const getUserRole = () => {
    if (!userProfile) return 'citizen';
    
    switch (userProfile.userType) {
      case 'driver':
        return 'field_operator';
      case 'citizen':
        return 'citizen';
      default:
        return 'citizen';
    }
  };

  const userRole = getUserRole();

  const handleBackToDashboard = () => {
    if (!userProfile) {
      navigate('/');
      return;
    }
    
    switch (userProfile.userType) {
      case 'citizen':
        navigate('/citizen');
        break;
      case 'driver':
        navigate('/driver');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  const handleModuleStart = (moduleId: string) => {
    setCurrentModule(moduleId);
    setCurrentView('module');
  };

  const handleModuleComplete = () => {
    setCurrentView('dashboard');
    setCurrentModule(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'module':
        return currentModule ? (
          <LearningModule 
            moduleId={currentModule} 
            onComplete={handleModuleComplete}
            onBack={() => setCurrentView('dashboard')}
          />
        ) : null;
      case 'progress':
        return <ProgressTracker onBack={() => setCurrentView('dashboard')} />;
      case 'certificate':
        return <Certificate onBack={() => setCurrentView('dashboard')} />;
      case 'waste-collection':
        return <WasteCollectionDashboard onBack={() => setCurrentView('dashboard')} onNavigate={setCurrentView} />;
      case 'bin-management':
        return <BinManagement onBack={() => setCurrentView('waste-collection')} />;
      case 'vehicle-tracking':
        return <VehicleTracking onBack={() => setCurrentView('waste-collection')} />;
      case 'scheduling':
        return <SchedulingEngine onBack={() => setCurrentView('waste-collection')} />;
      case 'bulk-waste':
        return <BulkWasteManagement onBack={() => setCurrentView('waste-collection')} />;
      case 'green-champions':
        return <GreenChampionsDashboard onBack={() => setCurrentView('dashboard')} onNavigate={setCurrentView} />;
      case 'champions-management':
        return <ChampionsManagement onBack={() => setCurrentView('green-champions')} />;
      case 'compliance-monitoring':
        return <ComplianceMonitoring onBack={() => setCurrentView('green-champions')} />;
      case 'analytics':
        return <AnalyticsDashboard onBack={() => setCurrentView('dashboard')} userRole={userRole} />;
      case 'facility-management':
        return <FacilityManagementDashboard onBack={() => setCurrentView('dashboard')} onNavigate={setCurrentView} />;
      case 'facility-directory':
        return <FacilityDirectory onBack={() => setCurrentView('facility-management')} />;
      case 'recycling-centers':
        return <RecyclingCenters onBack={() => setCurrentView('facility-management')} />;
      case 'scrap-booking':
        return <ScrapBookingSystem onBack={() => setCurrentView('facility-management')} />;
      case 'wte-monitoring':
        return <WTEMonitoring onBack={() => setCurrentView('facility-management')} />;
      case 'capacity-monitoring':
        return <CapacityMonitoring onBack={() => setCurrentView('facility-management')} />;
      default:
        return (
          <Dashboard 
            onModuleStart={handleModuleStart}
            onViewProgress={() => setCurrentView('progress')}
            onViewCertificate={() => setCurrentView('certificate')}
            onViewWasteCollection={() => setCurrentView('waste-collection')}
            onViewGreenChampions={() => setCurrentView('green-champions')}
            onViewAnalytics={() => setCurrentView('analytics')}
            onViewFacilityManagement={() => setCurrentView('facility-management')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Back to Dashboard Button - Top Left */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={handleBackToDashboard}
          variant="outline"
          className="gap-2 bg-white/95 backdrop-blur-sm border-primary/20 hover:bg-primary/5 hover:border-primary/40 shadow-premium hover:shadow-glow transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* User Role Display - styled to match existing project */}
      <div className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-xl shadow-premium p-4 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-hero text-primary-foreground">
            <Home className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">EcoLearn Role</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
      {renderCurrentView()}
    </div>
  );
}

export function EcoLearnApp() {
  return (
    <LanguageProvider>
      <ProgressProvider>
        <WasteCollectionProvider>
          <GreenChampionsProvider>
            <AnalyticsProvider>
              <FacilityProvider>
                <UserProvider>
                  <EcoLearnContent />
                </UserProvider>
              </FacilityProvider>
            </AnalyticsProvider>
          </GreenChampionsProvider>
        </WasteCollectionProvider>
      </ProgressProvider>
    </LanguageProvider>
  );
}

export default EcoLearnApp;
