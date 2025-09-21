import { ArrowLeft, Truck, MapPin, Award, Route, Clock, CheckCircle, Star, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";

const DriverPortalInfo = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: <Route className="h-8 w-8" />,
      title: "AI-Powered Route Optimization",
      description: "Get optimized routes calculated by advanced algorithms to minimize travel time and maximize efficiency."
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Real-Time Navigation",
      description: "Interactive maps with turn-by-turn directions and priority-based stop sequencing for efficient collection."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Check-In/Check-Out System",
      description: "Automatic GPS location capture and duty tracking with performance analytics and time management."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Performance Tracking",
      description: "Monitor your efficiency, completion rates, and earn points for excellent service delivery."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Priority Management",
      description: "Handle urgent waste collection requests with color-coded priority system and real-time alerts."
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Task Management",
      description: "View assigned reports, update collection status, and manage your daily workload efficiently."
    }
  ];

  const benefits = [
    "Reduce fuel consumption with optimized routes",
    "Increase daily collection efficiency by 40%",
    "Earn performance-based rewards and incentives",
    "Access real-time traffic and route updates",
    "Work with cutting-edge AI technology",
    "Contribute to environmental sustainability"
  ];

  const workflow = [
    {
      step: 1,
      title: "Check In",
      description: "Start your shift with automatic GPS location capture and duty status update."
    },
    {
      step: 2,
      title: "Get Optimized Routes",
      description: "Receive AI-calculated routes with priority-based stop sequencing for maximum efficiency."
    },
    {
      step: 3,
      title: "Follow Navigation",
      description: "Use interactive maps and turn-by-turn directions to reach collection points."
    },
    {
      step: 4,
      title: "Complete Collections",
      description: "Update collection status, take photos, and mark tasks as completed."
    },
    {
      step: 5,
      title: "Check Out",
      description: "End your shift and view daily performance metrics and earned points."
    }
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
            <Truck className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Driver Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our fleet of professional drivers using AI-powered route optimization to deliver efficient waste collection services.
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
              Why Join as a Driver?
            </h2>
            <p className="text-lg text-muted-foreground">
              Work smarter, not harder with our advanced technology and support
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

        {/* Workflow Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
            Your Daily Workflow
          </h2>
          
          <div className="space-y-8">
            {workflow.map((item, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary-foreground">{item.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-lg text-muted-foreground">
              Our route optimization uses machine learning to continuously improve efficiency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">40%</div>
              <div className="text-muted-foreground">Efficiency Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">25%</div>
              <div className="text-muted-foreground">Fuel Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Route Accuracy</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-hero rounded-2xl p-12 text-primary-foreground">
          <Truck className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to Drive Change?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our professional driver team and help build a more efficient waste management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/driver')}
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Truck className="h-5 w-5 mr-2" />
              Access Driver Portal
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Learn More About Citizens
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DriverPortalInfo;
