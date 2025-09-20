// 🔐 ADMIN PASSWORD: BetaWasteAdmin@2025

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { validateAdminPassword } from '@/utils/driverHelpers';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  ShieldCheck 
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  className?: string;
}

export const AdminLogin = ({ onLoginSuccess, className }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the admin password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate authentication delay for security
      await new Promise(resolve => setTimeout(resolve, 500));

      if (validateAdminPassword(password)) {
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the Admin Portal",
        });
        onLoginSuccess();
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin password. Access restricted.",
          variant: "destructive",
        });
        setPassword(''); // Clear password on failure
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Unable to authenticate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 ${className}`}>
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-400 mt-2">Swachh Saarthi Management System</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Admin Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pl-10 pr-12 bg-white/10 border-white/30 text-white placeholder:text-slate-400 focus:border-red-400 focus:ring-red-400"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Access Admin Portal
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-medium text-sm">Restricted Access</h4>
                <p className="text-red-300/80 text-xs mt-1">
                  This portal is restricted to authorized administrators only. 
                  All access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Development Info */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-600/50">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-slate-400 text-xs">Admin Portal v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
