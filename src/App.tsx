import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminPortal from "./pages/AdminPortal";
import MapInterface from "./components/MapInterface";
import NotFound from "./pages/NotFound";
import { EcoLearnApp } from "./components/ecolearn/EcoLearnApp";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Router component to handle auth redirects
const AppRouter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = (event: CustomEvent) => {
      const { path } = event.detail;
      navigate(path);
    };

    window.addEventListener('auth-redirect', handleAuthRedirect as EventListener);
    return () => {
      window.removeEventListener('auth-redirect', handleAuthRedirect as EventListener);
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/citizen" 
        element={
          <ProtectedRoute requiredUserType="citizen">
            <CitizenDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver" 
        element={
          <ProtectedRoute requiredUserType="driver">
            <DriverDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/map" element={<MapInterface />} />
      <Route path="/admin" element={<AdminPortal />} />
      
      {/* EcoLearn Routes */}
      <Route 
        path="/ecolearn/citizen" 
        element={
          <ProtectedRoute requiredUserType="citizen">
            <EcoLearnApp />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ecolearn/driver" 
        element={
          <ProtectedRoute requiredUserType="driver">
            <EcoLearnApp />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ecolearn/admin" 
        element={
          <ProtectedRoute requiredUserType="admin">
            <EcoLearnApp />
          </ProtectedRoute>
        } 
      />
      <Route path="/ecolearn" element={<EcoLearnApp />} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
