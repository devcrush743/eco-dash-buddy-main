import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type Role = "admin" | "driver" | "citizen";

interface GoToNewDashboardButtonProps {
	role: Role;
	className?: string;
}

export const GoToNewDashboardButton = ({ role, className }: GoToNewDashboardButtonProps) => {
    const navigate = useNavigate();
    
    // Navigate to EcoLearn project for each role
    const getEcoLearnUrl = (role: Role) => {
        switch (role) {
            case "driver":
                return "/ecolearn/driver";
            case "citizen":
                return "/ecolearn/citizen";
            case "admin":
                return "/ecolearn/admin";
            default:
                return "/ecolearn";
        }
    };
    
    const target = getEcoLearnUrl(role);
    
    const handleClick = () => {
        console.log(`Navigating to EcoLearn: ${target} for role: ${role}`);
        navigate(target);
    };

    return (
        <Button 
            onClick={handleClick}
            className={`gap-2 bg-gradient-hero shadow-premium hover:shadow-glow ${className || ""}`}
        >
            Go to Ecolearn
            <ArrowRight className="h-4 w-4" />
        </Button>
    );
    
};

export default GoToNewDashboardButton;


