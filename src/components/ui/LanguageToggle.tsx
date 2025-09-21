import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages, Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <div className="relative">
      <button
        onClick={toggleLanguage}
        className="group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border border-primary/20 hover:border-primary/30 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md backdrop-blur-sm min-h-[36px] sm:min-h-[40px]"
        aria-label={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center w-4 h-4 sm:w-6 sm:h-6">
          <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-primary transition-transform duration-300 group-hover:rotate-180" />
        </div>
        
        {/* Language text */}
        <span className="relative z-10 text-xs sm:text-sm font-medium text-primary transition-colors duration-300 group-hover:text-primary/80">
          {language === 'en' ? 'हिंदी' : 'English'}
        </span>
        
        {/* Animated indicator - hidden on very small screens */}
        <div className="relative z-10 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/60 group-hover:bg-primary transition-colors duration-300 hidden xs:block" />
        
        {/* Ripple effect on click */}
        <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-active:scale-100 transition-transform duration-150 ease-out" />
      </button>
      
      {/* Tooltip - hidden on mobile to avoid touch issues */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 hidden sm:block">
        {language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
};

export default LanguageToggle;
