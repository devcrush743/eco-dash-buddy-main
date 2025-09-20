import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation object
const translations = {
  en: {
    // Hero Section
    'hero.title': 'Smart Waste Management for a',
    'hero.title.highlight': 'Cleaner Tomorrow',
    'hero.subtitle': 'Smarter waste management. Cleaner neighborhoods.',
    'hero.feature1': 'Real-time tracking',
    'hero.feature2': 'Gamified rewards',
    'hero.feature3': 'Community driven',
    
    // Role Selection
    'role.title': 'Choose Your Role',
    'role.subtitle': 'Select how you\'d like to participate in our smart waste management system',
    
    // Citizen Portal
    'citizen.title': 'Citizen Portal',
    'citizen.description': 'Report waste issues, track collection status, and earn rewards for contributing to a cleaner community.',
    'citizen.feature1': 'Report issues with geo-tagging',
    'citizen.feature2': 'Earn points and rewards',
    'citizen.feature3': 'Track collection status',
    'citizen.button': 'Learn More',
    'citizen.button.dashboard': 'Enter Dashboard',
    
    // Driver Portal
    'driver.title': 'Driver Portal',
    'driver.description': 'Manage collection routes, respond to priority alerts, and earn points for efficient waste collection.',
    'driver.feature1': 'Optimized route planning',
    'driver.feature2': 'Performance tracking',
    'driver.feature3': 'Real-time task management',
    'driver.button': 'Learn More',
    'driver.button.dashboard': 'Enter Dashboard',
    
    // Stats
    'stats.citizens': 'Active Citizens',
    'stats.drivers': 'Drivers',
    'stats.resolved': 'Issues Resolved',
    'stats.collection': 'Collection Rate',
    
    // Portal Access
    'portal.title': 'Portal Access',
    'portal.subtitle': 'Quick access for administrators and drivers',
    'admin.title': 'Admin Portal',
    'admin.restricted': 'Restricted Access',
    'admin.description': 'Manage drivers, monitor system performance, and access administrative controls.',
    'admin.button': 'Admin Login',
    'quick.title': 'Quick Access',
    'quick.subtitle': 'Sign In Options',
    'quick.description': 'Drivers can sign in using the "Sign In" button in the top navigation bar with their admin-provided credentials.',
    'quick.driver.info': 'For Drivers:',
    'quick.driver.instruction': 'Use the navbar "Sign In" → "Continue as Driver" with your Driver ID (e.g., DRV001) and password.',
    
    // Footer
    'footer.tagline': 'Building cleaner communities through smart waste management',
    
    // Language Toggle
    'language.english': 'English',
    'language.hindi': 'हिंदी'
  },
  hi: {
    // Hero Section
    'hero.title': 'एक के लिए स्मार्ट कचरा प्रबंधन',
    'hero.title.highlight': 'स्वच्छ कल',
    'hero.subtitle': 'स्मार्ट कचरा प्रबंधन। स्वच्छ पड़ोस।',
    'hero.feature1': 'वास्तविक समय ट्रैकिंग',
    'hero.feature2': 'गेमिफाइड पुरस्कार',
    'hero.feature3': 'समुदाय संचालित',
    
    // Role Selection
    'role.title': 'अपनी भूमिका चुनें',
    'role.subtitle': 'हमारे स्मार्ट कचरा प्रबंधन प्रणाली में भाग लेने का तरीका चुनें',
    
    // Citizen Portal
    'citizen.title': 'नागरिक पोर्टल',
    'citizen.description': 'कचरा समस्याओं की रिपोर्ट करें, संग्रह स्थिति को ट्रैक करें, और स्वच्छ समुदाय में योगदान के लिए पुरस्कार अर्जित करें।',
    'citizen.feature1': 'जियो-टैगिंग के साथ समस्याओं की रिपोर्ट करें',
    'citizen.feature2': 'अंक और पुरस्कार अर्जित करें',
    'citizen.feature3': 'संग्रह स्थिति को ट्रैक करें',
    'citizen.button': 'और जानें',
    'citizen.button.dashboard': 'डैशबोर्ड में प्रवेश करें',
    
    // Driver Portal
    'driver.title': 'ड्राइवर पोर्टल',
    'driver.description': 'संग्रह मार्गों का प्रबंधन करें, प्राथमिकता अलर्ट का जवाब दें, और कुशल कचरा संग्रह के लिए अंक अर्जित करें।',
    'driver.feature1': 'अनुकूलित मार्ग योजना',
    'driver.feature2': 'प्रदर्शन ट्रैकिंग',
    'driver.feature3': 'वास्तविक समय कार्य प्रबंधन',
    'driver.button': 'और जानें',
    'driver.button.dashboard': 'डैशबोर्ड में प्रवेश करें',
    
    // Stats
    'stats.citizens': 'सक्रिय नागरिक',
    'stats.drivers': 'ड्राइवर',
    'stats.resolved': 'समस्याएं हल',
    'stats.collection': 'संग्रह दर',
    
    // Portal Access
    'portal.title': 'पोर्टल पहुंच',
    'portal.subtitle': 'प्रशासकों और ड्राइवरों के लिए त्वरित पहुंच',
    'admin.title': 'एडमिन पोर्टल',
    'admin.restricted': 'प्रतिबंधित पहुंच',
    'admin.description': 'ड्राइवरों का प्रबंधन करें, सिस्टम प्रदर्शन की निगरानी करें, और प्रशासनिक नियंत्रण तक पहुंचें।',
    'admin.button': 'एडमिन लॉगिन',
    'quick.title': 'त्वरित पहुंच',
    'quick.subtitle': 'साइन इन विकल्प',
    'quick.description': 'ड्राइवर शीर्ष नेविगेशन बार में "साइन इन" बटन का उपयोग करके अपने एडमिन-प्रदत्त क्रेडेंशियल के साथ साइन इन कर सकते हैं।',
    'quick.driver.info': 'ड्राइवरों के लिए:',
    'quick.driver.instruction': 'नेवबार "साइन इन" → "ड्राइवर के रूप में जारी रखें" का उपयोग करें अपने ड्राइवर आईडी (जैसे, DRV001) और पासवर्ड के साथ।',
    
    // Footer
    'footer.tagline': 'स्मार्ट कचरा प्रबंधन के माध्यम से स्वच्छ समुदायों का निर्माण',
    
    // Language Toggle
    'language.english': 'English',
    'language.hindi': 'हिंदी'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
