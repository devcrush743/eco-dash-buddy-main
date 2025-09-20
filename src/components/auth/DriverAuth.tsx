import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Truck, User, Lock, Loader2 } from 'lucide-react';
// Removed linking UI and Firestore user linking logic per new requirement

interface DriverAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DriverAuth = ({ isOpen, onClose, onSuccess }: DriverAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ driverId: '', password: '' });
  
  const { signInDriver } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDriverSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.driverId || !loginData.password) {
      toast({
        title: "Missing information",
        description: "Please enter your Driver ID and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Driver login attempt started');
      await signInDriver(loginData.driverId, loginData.password);
      
      console.log('✅ Driver login successful, navigating to /driver');
      toast({
        title: "Welcome back!",
        description: `Signed in as Driver ${loginData.driverId}`,
      });
      
      // Close modal first
      onClose();
      onSuccess();
      
      // Navigate to driver dashboard immediately
      navigate('/driver');
      
    } catch (error: any) {
      console.error('❌ Driver login failed:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid Driver ID or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Linking flow removed

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-display font-bold text-primary tracking-tight flex items-center justify-center gap-3">
            <Truck className="h-7 w-7" />
            Driver Portal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Sign in with your municipal-issued Driver ID
            </p>
            <div className="bg-gradient-hero/10 rounded-lg p-3">
              <p className="text-xs text-primary font-medium">
                🔒 Secure access for waste collection personnel
              </p>
            </div>
          </div>

          <form onSubmit={handleDriverSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driverId">Driver ID</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="driverId"
                  type="text"
                  placeholder="e.g., DRV001, DRV002"
                  value={loginData.driverId}
                  onChange={(e) => setLoginData(prev => ({ ...prev, driverId: e.target.value.toUpperCase() }))}
                  className="pl-10 h-12 rounded-xl uppercase font-mono"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your municipal-issued Driver ID
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="driver-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="driver-password"
                  type="password"
                  placeholder="Your secure password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 h-12 rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-gradient-hero rounded-xl shadow-premium hover:shadow-glow transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Truck className="h-5 w-5 mr-2" />
              )}
              Access Driver Portal
            </Button>
          </form>

          {/* Admin creates drivers; drivers log in with ID + password. Linking UI removed. */}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Need help?</h4>
            <p className="text-xs text-muted-foreground">
              Contact your supervisor or municipal administrator for login credentials.
            </p>
            <p className="text-xs text-muted-foreground">
              Driver IDs follow format: DRV### (e.g., DRV001, DRV042)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
