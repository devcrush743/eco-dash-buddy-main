import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Upload,
  Send,
  Clock,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';

interface ReportingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  tips?: string[];
  color: string;
  bgColor: string;
}

const reportingSteps: ReportingStep[] = [
  {
    id: 1,
    title: "Describe the Issue",
    description: "Provide a detailed description of the waste management problem",
    icon: <FileText className="h-8 w-8" />,
    details: [
      "Be specific about the type of waste",
      "Mention the exact location details",
      "Describe the severity of the issue",
      "Include any safety concerns"
    ],
    tips: [
      "Use clear, descriptive language",
      "Mention if it's a recurring problem",
      "Include time of day if relevant"
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    id: 2,
    title: "Set Priority Level",
    description: "Choose the urgency level for your report",
    icon: <AlertTriangle className="h-8 w-8" />,
    details: [
      "Normal: Regular waste collection issues",
      "Urgent: Health hazards or safety risks",
      "Emergency: Immediate danger to public",
      "Priority affects response time"
    ],
    tips: [
      "Choose 'Urgent' for health hazards",
      "Normal issues get standard response",
      "Emergency reports get immediate attention"
    ],
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    id: 3,
    title: "Capture Location",
    description: "Provide precise location coordinates for the issue",
    icon: <MapPin className="h-8 w-8" />,
    details: [
      "Use GPS for automatic location capture",
      "Select location on interactive map",
      "Coordinates are automatically geotagged",
      "Location accuracy is crucial for drivers"
    ],
    tips: [
      "Enable location services for best results",
      "Use map picker for precise positioning",
      "Location helps drivers find the issue quickly"
    ],
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    id: 4,
    title: "Add Photo Evidence",
    description: "Upload photos to support your report (optional but recommended)",
    icon: <Camera className="h-8 w-8" />,
    details: [
      "Photos help drivers identify the issue",
      "Images are automatically geotagged",
      "Supports JPEG, PNG, WebP formats",
      "Maximum file size: 10MB"
    ],
    tips: [
      "Take clear, well-lit photos",
      "Include multiple angles if possible",
      "Photos increase report credibility"
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    id: 5,
    title: "Submit Report",
    description: "Review and submit your waste management report",
    icon: <Send className="h-8 w-8" />,
    details: [
      "Review all information before submitting",
      "Report is sent to waste management team",
      "You'll receive confirmation and tracking ID",
      "Status updates will be provided"
    ],
    tips: [
      "Double-check location accuracy",
      "Ensure description is complete",
      "Keep your report ID for tracking"
    ],
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    id: 6,
    title: "Track Progress",
    description: "Monitor your report status and driver assignment",
    icon: <Clock className="h-8 w-8" />,
    details: [
      "View real-time status updates",
      "See when driver is assigned",
      "Track collection progress",
      "Get notified when completed"
    ],
    tips: [
      "Check dashboard for updates",
      "Urgent reports get priority",
      "You can approve completion"
    ],
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  }
];

interface ReportingStepsCarouselProps {
  onStartReporting?: () => void;
  className?: string;
}

export const ReportingStepsCarousel = ({ onStartReporting, className }: ReportingStepsCarouselProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % reportingSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + reportingSteps.length) % reportingSteps.length);
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = reportingSteps[currentStep];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
          How to Report Waste Issues
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Follow these simple steps to report waste management issues in your community
        </p>
      </div>

      {/* Carousel Container */}
      <Card className="overflow-hidden shadow-depth hover:shadow-premium transition-all duration-300">
        <div className="relative">
          {/* Step Content */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${currentStepData.bgColor} ${currentStepData.color}`}>
                  {currentStepData.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-foreground">
                    Step {currentStepData.id}: {currentStepData.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentStepData.description}
                  </p>
                </div>
              </div>
              
              <Badge variant="outline" className="text-sm px-3 py-1">
                {currentStep + 1} of {reportingSteps.length}
              </Badge>
            </div>

            {/* Step Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">What to do:</h4>
                <ul className="space-y-2">
                  {currentStepData.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {currentStepData.tips && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground">Pro Tips:</h4>
                  <ul className="space-y-2">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {reportingSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentStep
                        ? 'bg-primary scale-125'
                        : 'bg-muted hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={nextStep}
                disabled={currentStep === reportingSteps.length - 1}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-gradient-hero transition-all duration-500"
              style={{ width: `${((currentStep + 1) / reportingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Quick Start Button */}
      {onStartReporting && (
        <div className="text-center">
          <Button
            onClick={onStartReporting}
            size="lg"
            className="bg-gradient-hero text-lg font-display font-semibold px-8 py-4 rounded-xl shadow-premium hover:shadow-glow transition-all duration-300"
          >
            Start Reporting Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-foreground">Community Impact</h3>
          <p className="text-sm text-muted-foreground">
            Help keep your neighborhood clean and safe for everyone
          </p>
        </Card>

        <Card className="p-6 text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-foreground">Quick Response</h3>
          <p className="text-sm text-muted-foreground">
            Reports are processed quickly with priority-based response times
          </p>
        </Card>

        <Card className="p-6 text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Award className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-foreground">Earn Rewards</h3>
          <p className="text-sm text-muted-foreground">
            Get points and recognition for contributing to community cleanliness
          </p>
        </Card>
      </div>
    </div>
  );
};
