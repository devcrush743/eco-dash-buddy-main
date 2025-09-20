import { Award, TrendingUp, Target, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PointsSystemProps {
  currentPoints: number;
  userType: "citizen" | "driver";
  rank: string;
  pointsToNextLevel?: number;
}

const PointsSystem = ({ currentPoints, userType, rank, pointsToNextLevel = 150 }: PointsSystemProps) => {
  const achievements = [
    { 
      id: 1, 
      title: "Eco Warrior", 
      description: "Reported 50+ issues", 
      icon: Leaf, 
      earned: currentPoints > 500,
      points: 500 
    },
    { 
      id: 2, 
      title: "Community Champion", 
      description: "100% accuracy rate", 
      icon: Award, 
      earned: currentPoints > 750,
      points: 750 
    },
    { 
      id: 3, 
      title: "Green Guardian", 
      description: "1000+ points earned", 
      icon: Target, 
      earned: currentPoints > 1000,
      points: 1000 
    }
  ];

  const progressPercentage = Math.min((currentPoints % 1000) / 10, 100);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Points Overview */}
      <Card className="p-4 sm:p-6 bg-gradient-eco text-primary-foreground">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{currentPoints.toLocaleString()} Points</h2>
            <p className="text-sm sm:text-base text-primary-foreground/80">{rank}</p>
          </div>
          <div className="text-left sm:text-right">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2" />
            <p className="text-xs sm:text-sm text-primary-foreground/80">+{pointsToNextLevel} to next level</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Progress to next level</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="bg-primary-foreground/20 h-2" />
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Achievements</h3>
        <div className="grid gap-3 sm:gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id} 
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all ${
                  achievement.earned 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border bg-muted/20'
                }`}
              >
                <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                  achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1">
                    <h4 className="font-semibold text-sm sm:text-base truncate">{achievement.title}</h4>
                    {achievement.earned && (
                      <Badge variant="default" className="text-xs flex-shrink-0">
                        +{achievement.points} pts
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>
                </div>
                {achievement.earned && (
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Leaderboard Preview */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          {userType === "citizen" ? "Community Leaderboard" : "Driver Rankings"}
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {[
            { rank: 1, name: "Alex Chen", points: 2450, isCurrentUser: false },
            { rank: 2, name: "You", points: currentPoints, isCurrentUser: true },
            { rank: 3, name: "Maria Garcia", points: 1100, isCurrentUser: false },
            { rank: 4, name: "John Smith", points: 950, isCurrentUser: false },
            { rank: 5, name: "Sarah Johnson", points: 875, isCurrentUser: false }
          ].map((user) => (
            <div 
              key={user.rank} 
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                user.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${
                  user.rank === 1 ? 'bg-yellow-500 text-yellow-50' :
                  user.rank === 2 ? 'bg-gray-400 text-gray-50' :
                  user.rank === 3 ? 'bg-amber-600 text-amber-50' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {user.rank}
                </div>
                <span className={`font-medium text-sm sm:text-base truncate ${user.isCurrentUser ? 'text-primary' : ''}`}>
                  {user.name}
                </span>
              </div>
              <span className="font-semibold text-primary text-xs sm:text-sm flex-shrink-0 ml-2">{user.points.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PointsSystem;