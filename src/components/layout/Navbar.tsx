import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NavbarSignIn } from "@/components/auth/NavbarSignIn";
import { useNavigate } from "react-router-dom";
import GoToNewDashboardButton from "@/components/GoToNewDashboardButton";
import { 
  User, 
  LogOut, 
  Home, 
  Award, 
  Settings, 
  ChevronDown,
  Truck,
  Users
} from "lucide-react";

interface NavbarProps {
  showBackToHome?: boolean;
}

export const Navbar = ({ showBackToHome = false }: NavbarProps) => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserTypeIcon = () => {
    if (userProfile?.userType === 'driver') {
      return <Truck className="h-4 w-4" />;
    }
    return <Users className="h-4 w-4" />;
  };

  const getUserTypeColor = () => {
    if (userProfile?.userType === 'driver') {
      return 'bg-blue-500';
    }
    return 'bg-green-500';
  };

  return (
    <header className="bg-card/80 backdrop-blur-xl shadow-depth border-b border-border/50 p-3 sm:p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight leading-tight">
              <span className="text-black">Swatchh</span> <span className="text-primary">सारथि</span>
            </h1>
          </div>
          
          {/* Back to Home Button - Show on dashboard pages */}
          {showBackToHome && currentUser && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 border border-primary/20 hover:border-primary/40 text-muted-foreground hover:text-foreground hover:shadow-glow transition-all duration-300"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          )}
        </div>

        {/* Go-to-dashboard + User Profile or Login */}
        <div className="flex items-center gap-4">
          {currentUser && userProfile && (userProfile.userType === 'driver' || userProfile.userType === 'citizen') && (
            <GoToNewDashboardButton role={userProfile.userType === 'driver' ? 'driver' : 'citizen'} />
          )}
          {currentUser && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 p-2 h-auto hover:bg-muted/50 rounded-xl transition-colors"
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={userProfile.photoURL} />
                    <AvatarFallback className={`${getUserTypeColor()} text-white text-xs sm:text-sm font-semibold`}>
                      {getUserInitials(userProfile.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* User Info - Hidden on mobile */}
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {userProfile.displayName}
                      </span>
                      {getUserTypeIcon()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        {userProfile.userType}
                      </Badge>
                      {userProfile.points !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {userProfile.points} pts
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                {/* Mobile User Info */}
                <div className="sm:hidden p-2 border-b">
                  <div className="flex items-center gap-3">
                    {getUserTypeIcon()}
                    <div>
                      <p className="text-sm font-semibold">{userProfile.displayName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{userProfile.userType}</p>
                    </div>
                  </div>
                  {userProfile.points !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">{userProfile.points} points</span>
                      <Badge variant="outline" className="text-xs">
                        {userProfile.rank}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Navigation Items */}
                <DropdownMenuItem 
                  onClick={() => navigate('/')}
                  className="cursor-pointer"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={() => navigate(userProfile.userType === 'citizen' ? '/citizen' : '/driver')}
                  className="cursor-pointer"
                >
                  {userProfile.userType === 'citizen' ? (
                    <Users className="mr-2 h-4 w-4" />
                  ) : (
                    <Truck className="mr-2 h-4 w-4" />
                  )}
                  <span>Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                {userProfile.points !== undefined && (
                  <DropdownMenuItem className="cursor-pointer">
                    <Award className="mr-2 h-4 w-4" />
                    <span>Rewards ({userProfile.points} pts)</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Driver ID for drivers */}
                {userProfile.userType === 'driver' && userProfile.driverId && (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-muted-foreground">Driver ID</p>
                      <p className="text-sm font-mono font-semibold">{userProfile.driverId}</p>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Show beautiful sign-in dropdown when not authenticated */
            <NavbarSignIn />
          )}
        </div>
      </div>
    </header>
  );
};
