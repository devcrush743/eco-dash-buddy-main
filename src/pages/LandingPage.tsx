import { useState } from "react";
import { Users, Truck, MapPin, Award, ArrowRight, Recycle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import LanguageToggle from "@/components/ui/LanguageToggle";
import heroImage from "@/assets/hero-waste-management.jpg";
import citizenImage from "@/assets/citizen-illustration.jpg";
import driverImage from "@/assets/driver-illustration.jpg";

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();

  const handleCitizenClick = () => {
    navigate('/citizen-info');
  };

  const handleDriverClick = () => {
    navigate('/driver-info');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };


  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 -mt-8 pb-8 sm:py-12 relative">
        {/* Mobile Background Image */}
        <div className="absolute inset-0 sm:hidden z-0">
          <img 
            src="/mobile-bg.png" 
            alt="Mobile Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center space-y-8 sm:space-y-12 w-full max-w-6xl relative z-10">
          <div className="space-y-8 sm:space-y-12 animate-fade-in-up w-full">
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-display font-bold text-foreground leading-[0.9] tracking-tight">
                {t('hero.title')} 
                <span className="text-transparent bg-clip-text bg-gradient-hero animate-shimmer"> {t('hero.title.highlight')}</span>
              </h1>
              <p className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-muted-foreground leading-tight tracking-tight font-display font-medium max-w-5xl mx-auto">
                {t('hero.subtitle')}
              </p>
            </div>

            <div className="hidden sm:flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10">
              <div className="flex items-center gap-3 sm:gap-4 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gradient-hero rounded-full animate-pulse-glow" />
                <span className="text-base sm:text-lg md:text-xl font-display font-medium tracking-tight">{t('hero.feature1')}</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 animate-slide-in" style={{ animationDelay: '0.3s' }}>
                <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gradient-hero rounded-full animate-pulse-glow" />
                <span className="text-base sm:text-lg md:text-xl font-display font-medium tracking-tight">{t('hero.feature2')}</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gradient-hero rounded-full animate-pulse-glow" />
                <span className="text-base sm:text-lg md:text-xl font-display font-medium tracking-tight">{t('hero.feature3')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 text-foreground tracking-tight leading-tight">{t('role.title')}</h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground font-display font-medium max-w-3xl mx-auto leading-tight tracking-tight px-4">
            {t('role.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 max-w-6xl mx-auto">
          {/* Citizen Portal */}
          <Card className="p-6 sm:p-8 md:p-10 hover:shadow-premium transition-all duration-500 transform hover:-translate-y-2 sm:hover:-translate-y-4 cursor-pointer group border-0 bg-gradient-card shadow-depth animate-fade-in-up overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="space-y-6 sm:space-y-8 relative z-10">
              <div className="relative h-40 sm:h-48 md:h-56 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner">
                <img 
                  src={citizenImage} 
                  alt="Citizen Portal"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-4 sm:p-6">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary-foreground animate-bounce-gentle" />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight leading-tight">{t('citizen.title')}</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-tight tracking-tight font-display">
                  {t('citizen.description')}
                </p>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base font-display font-medium tracking-tight">{t('citizen.feature1')}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base font-display font-medium tracking-tight">{t('citizen.feature2')}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base font-display font-medium tracking-tight">{t('citizen.feature3')}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCitizenClick}
                  className="w-full h-12 sm:h-14 bg-gradient-hero text-base sm:text-lg font-display font-semibold rounded-xl sm:rounded-2xl shadow-premium group-hover:shadow-glow transform group-hover:scale-105 transition-all duration-300"
                >
                  {t('citizen.button')}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Driver Portal */}
          <Card className="p-6 sm:p-8 md:p-10 hover:shadow-premium transition-all duration-500 transform hover:-translate-y-2 sm:hover:-translate-y-4 cursor-pointer group border-0 bg-gradient-card shadow-depth animate-fade-in-up overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="space-y-6 sm:space-y-8 relative z-10">
              <div className="relative h-40 sm:h-48 md:h-56 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner">
                <img 
                  src={driverImage} 
                  alt="Driver Portal"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-4 sm:p-6">
                  <Truck className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary-foreground animate-bounce-gentle" />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight leading-tight">{t('driver.title')}</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-tight tracking-tight font-display">
                  {t('driver.description')}
                </p>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base font-display font-medium tracking-tight">{t('driver.feature1')}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base font-display font-medium tracking-tight">{t('driver.feature2')}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base font-display font-medium tracking-tight">{t('driver.feature3')}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleDriverClick}
                  className="w-full h-12 sm:h-14 bg-gradient-hero text-base sm:text-lg font-display font-semibold rounded-xl sm:rounded-2xl shadow-premium group-hover:shadow-glow transform group-hover:scale-105 transition-all duration-300"
                >
                  {t('driver.button')}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1 sm:mb-2">1,250+</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-display tracking-tight">{t('stats.citizens')}</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1 sm:mb-2">85+</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-display tracking-tight">{t('stats.drivers')}</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1 sm:mb-2">15,400+</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-display tracking-tight">{t('stats.resolved')}</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1 sm:mb-2">98%</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-display tracking-tight">{t('stats.collection')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin & Driver Portal Access */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 sm:mb-4 text-foreground tracking-tight leading-tight">
              {t('portal.title')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-display font-medium max-w-2xl mx-auto leading-tight tracking-tight">
              {t('portal.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Admin Portal */}
            <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 tracking-tight">{t('admin.title')}</h3>
                  <p className="text-xs sm:text-sm text-red-600 font-medium">{t('admin.restricted')}</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-4 font-display">
                {t('admin.description')}
              </p>
              <Button 
                onClick={handleAdminClick}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold"
              >
                {t('admin.button')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>

            {/* Quick Access Info */}
            <Card className="p-4 sm:p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 tracking-tight">{t('quick.title')}</h3>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">{t('quick.subtitle')}</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-4 font-display">
                {t('quick.description')}
              </p>
              <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-800">
                <strong>{t('quick.driver.info')}</strong> {t('quick.driver.instruction')}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Logo Section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight leading-tight">
            <span className="text-black">Swatchh</span> <span className="text-primary">सारथि</span>
          </h1>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gradient-eco text-primary-foreground py-4 sm:py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm sm:text-base text-primary-foreground/80 px-4 font-display tracking-tight leading-tight">
            {t('footer.tagline')}
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;