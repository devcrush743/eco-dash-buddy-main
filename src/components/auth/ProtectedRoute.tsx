import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'citizen' | 'driver' | 'admin';
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredUserType, 
  redirectTo = '/' 
}: ProtectedRouteProps) => {
  const { currentUser, userProfile, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-display">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!currentUser || !userProfile) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user type matches requirement
  if (requiredUserType && userProfile.userType !== requiredUserType) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
