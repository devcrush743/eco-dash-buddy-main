import { useState } from "react";
import { Users, Truck, ArrowRight, Chrome, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CitizenAuth } from "./CitizenAuth";
import { DriverAuth } from "./DriverAuth";
import citizenImage from "@/assets/citizen-illustration.jpg";
import driverImage from "@/assets/driver-illustration.jpg";

interface NavbarSignInProps {
  onAuthSuccess?: () => void;
}

export const NavbarSignIn = ({ onAuthSuccess }: NavbarSignInProps) => {
  const [showCitizenAuth, setShowCitizenAuth] = useState(false);
  const [showDriverAuth, setShowDriverAuth] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCitizenClick = () => {
    setIsDropdownOpen(false);
    setShowCitizenAuth(true);
  };

  const handleDriverClick = () => {
    setIsDropdownOpen(false);
    setShowDriverAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowCitizenAuth(false);
    setShowDriverAuth(false);
    onAuthSuccess?.();
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-10 px-6 rounded-xl border-2 border-primary/20 hover:border-primary hover:shadow-glow transition-all duration-300 bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10"
          >
            <span className="font-semibold">Sign In</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-[calc(100vw-2rem)] sm:w-96 max-w-md p-0 border-0 shadow-premium bg-transparent"
          sideOffset={8}
        >
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-depth overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 bg-gradient-hero text-primary-foreground">
              <h3 className="text-lg font-display font-bold text-center tracking-tight">
                Choose Your Role
              </h3>
              <p className="text-center text-primary-foreground/80 text-sm mt-1">
                Select how you'd like to access the system
              </p>
            </div>

            {/* Role Cards */}
            <div className="p-3 sm:p-4 space-y-3">
              {/* Citizen Card */}
              <Card 
                className="p-3 sm:p-4 hover:shadow-premium transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border-0 bg-gradient-card relative overflow-hidden"
                onClick={handleCitizenClick}
              >
                <div className="absolute inset-0 bg-gradient-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                    <img 
                      src={citizenImage} 
                      alt="Citizen"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end justify-center p-2">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-foreground tracking-tight">
                      Citizen Portal
                    </h4>
                    <p className="text-sm text-muted-foreground leading-tight mt-1">
                      Report issues, track collections, earn rewards
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Chrome className="h-3 w-3" />
                        <span>Google</span>
                      </div>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Mail className="h-3 w-3" />
                        <span>Email</span>
                      </div>
                    </div>
                  </div>
                  
                  <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Card>

              {/* Driver Card */}
              <Card 
                className="p-3 sm:p-4 hover:shadow-premium transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border-0 bg-gradient-card relative overflow-hidden"
                onClick={handleDriverClick}
              >
                <div className="absolute inset-0 bg-gradient-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                    <img 
                      src={driverImage} 
                      alt="Driver"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end justify-center p-2">
                      <Truck className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-foreground tracking-tight">
                      Driver Portal
                    </h4>
                    <p className="text-sm text-muted-foreground leading-tight mt-1">
                      Manage routes, complete tasks, track performance
                    </p>
                    <div className="bg-gradient-hero/10 rounded-lg px-2 py-1 mt-2">
                      <p className="text-xs text-primary font-medium">
                        🔒 Municipal ID Required
                      </p>
                    </div>
                  </div>
                  
                  <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Card>
            </div>

            {/* Footer */}
            <div className="p-4 pt-2 border-t border-border/50 bg-muted/20">
              <p className="text-xs text-center text-muted-foreground">
                New to Swachh Saarthi? Sign up will be available after role selection
              </p>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Authentication Modals */}
      <CitizenAuth 
        isOpen={showCitizenAuth} 
        onClose={() => setShowCitizenAuth(false)}
        onSuccess={handleAuthSuccess}
      />
      
      <DriverAuth 
        isOpen={showDriverAuth} 
        onClose={() => setShowDriverAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};
