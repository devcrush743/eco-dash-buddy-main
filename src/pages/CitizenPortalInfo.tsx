import { ArrowLeft, Users, MapPin, Award, Camera, Clock, CheckCircle, Star, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";

const CitizenPortalInfo = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Geo-Tagged Reporting",
      description: "Report waste issues with precise GPS location and photo evidence for accurate tracking and faster resolution."
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Photo Documentation",
      description: "Capture and upload photos of waste issues with automatic location stamping for better documentation."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Real-Time Tracking",
      description: "Track your report status from submission to resolution with live updates and notifications."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Points & Rewards",
      description: "Earn points for active participation and redeem rewards for contributing to a cleaner community."
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Approval System",
      description: "Review and approve collection confirmations to ensure quality service and proper waste disposal."
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Community Impact",
      description: "See your contribution to making the community cleaner and more sustainable through detailed analytics."
    }
  ];

  const benefits = [
    "Immediate response to waste issues in your area",
    "Contribute to environmental sustainability",
    "Earn rewards for active participation",
    "Help improve waste management efficiency",
    "Build a cleaner, healthier community",
    "Access to real-time updates and notifications"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-hero rounded-full mb-6">
            <Users className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Citizen Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of citizens actively contributing to cleaner communities through our smart waste management platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-premium transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-card">
              <div className="text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-card rounded-2xl p-8 mb-16 shadow-depth">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Why Join as a Citizen?
            </h2>
            <p className="text-lg text-muted-foreground">
              Make a real difference in your community while earning rewards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Report Issues
              </h3>
              <p className="text-muted-foreground">
                Take a photo and report waste issues with automatic GPS location tagging.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Track Progress
              </h3>
              <p className="text-muted-foreground">
                Monitor your report status and get real-time updates on collection progress.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Earn Rewards
              </h3>
              <p className="text-muted-foreground">
                Get points for active participation and redeem rewards for your contributions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-hero rounded-2xl p-12 text-primary-foreground">
          <Shield className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community of active citizens and help build a cleaner, more sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/citizen')}
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Users className="h-5 w-5 mr-2" />
              Access Citizen Portal
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Learn More About Drivers
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CitizenPortalInfo;
