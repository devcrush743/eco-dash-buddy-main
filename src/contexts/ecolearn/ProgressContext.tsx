import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModuleProgress {
  id: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  completedSections: number[];
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  quizScore?: number;
  completedAt?: Date;
}

interface ProgressContextType {
  moduleProgress: Record<string, ModuleProgress>;
  updateModuleProgress: (moduleId: string, progress: Partial<ModuleProgress>) => void;
  getOverallProgress: () => number;
  getTotalCompletedModules: () => number;
  hasCertificate: () => boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({
    'waste-sorting': { id: 'waste-sorting', status: 'not-started', progress: 0, completedSections: [], currentStep: 0, totalSteps: 3, completed: false },
    'composting': { id: 'composting', status: 'not-started', progress: 0, completedSections: [], currentStep: 0, totalSteps: 3, completed: false },
    'recycling': { id: 'recycling', status: 'not-started', progress: 0, completedSections: [], currentStep: 0, totalSteps: 3, completed: false },
    'hazardous-waste': { id: 'hazardous-waste', status: 'not-started', progress: 0, completedSections: [], currentStep: 0, totalSteps: 3, completed: false }
  });

  const updateModuleProgress = (moduleId: string, progress: Partial<ModuleProgress>) => {
    setModuleProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        ...progress,
        id: moduleId
      }
    }));
  };

  const getOverallProgress = () => {
    const modules = Object.values(moduleProgress);
    const totalProgress = modules.reduce((sum, module) => sum + module.progress, 0);
    return totalProgress / modules.length;
  };

  const getTotalCompletedModules = () => {
    return Object.values(moduleProgress).filter(module => module.status === 'completed').length;
  };

  const hasCertificate = () => {
    return getTotalCompletedModules() === Object.keys(moduleProgress).length;
  };

  return (
    <ProgressContext.Provider value={{
      moduleProgress,
      updateModuleProgress,
      getOverallProgress,
      getTotalCompletedModules,
      hasCertificate
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};