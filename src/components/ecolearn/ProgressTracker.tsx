import React from 'react';
import { ArrowLeft, CheckCircle, Clock, XCircle, Trophy, Target, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProgress } from '../../contexts/ecolearn/ProgressContext';

interface ProgressTrackerProps {
  onBack: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { moduleProgress, getOverallProgress, getTotalCompletedModules, hasCertificate } = useProgress();

  const modules = [
    {
      id: 'waste-sorting',
      title: t('wastesorting'),
      icon: '🗂️',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'composting',
      title: t('composting'),
      icon: '🌱',
      color: 'from-emerald-400 to-emerald-600'
    },
    {
      id: 'recycling',
      title: t('recycling'),
      icon: '♻️',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'hazardous-waste',
      title: t('hazardous'),
      icon: '⚠️',
      color: 'from-orange-400 to-orange-600'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      default:
        return <XCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const CircularProgress: React.FC<{ percentage: number; size: number; color: string }> = ({ 
    percentage, 
    size, 
    color 
  }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="progress-ring" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={strokeDasharray}
            className={color}
            style={{ strokeLinecap: 'round' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-700">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

  const overallProgress = getOverallProgress();
  const completedModules = getTotalCompletedModules();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 slide-in">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToDashboard')}</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('progress')} Tracking
          </h1>
          <p className="text-gray-600">
            Monitor your learning journey and achievements
          </p>
        </header>

        {/* Overall Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 slide-in">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{t('overall')}</h3>
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center justify-center">
              <CircularProgress 
                percentage={overallProgress} 
                size={120} 
                color="text-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Completed Modules</h3>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {completedModules}/4
              </div>
              <p className="text-gray-600">Modules Finished</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Certification Status</h3>
              <Trophy className={`w-6 h-6 ${hasCertificate() ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${hasCertificate() ? 'text-green-600' : 'text-gray-500'}`}>
                {hasCertificate() ? 'CERTIFIED' : 'IN PROGRESS'}
              </div>
              <p className="text-gray-600">
                {hasCertificate() ? 'Certificate Ready' : `${4 - completedModules} modules remaining`}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Module Progress */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden slide-in">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Module Progress Details</h2>
            <p>Track your progress through each learning module</p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {modules.map((module) => {
                const progress = moduleProgress[module.id];
                const completedAt = progress.completedAt ? new Date(progress.completedAt) : null;
                
                return (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{module.icon}</div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {module.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(progress.status)}
                            <span className="text-sm text-gray-600 capitalize">
                              {progress.status.replace('-', ' ')}
                            </span>
                            {completedAt && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>{completedAt.toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <CircularProgress 
                          percentage={progress.progress} 
                          size={80} 
                          color="text-green-500"
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 bg-gradient-to-r ${module.color} rounded-full transition-all duration-500`}
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Sections:</span>
                        <span className="ml-2 font-medium">
                          {progress.completedSections.length}/3
                        </span>
                      </div>
                      {progress.quizScore && (
                        <div>
                          <span className="text-gray-500">Quiz Score:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {progress.quizScore}%
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          progress.status === 'completed' ? 'text-green-600' :
                          progress.status === 'in-progress' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {progress.status.replace('-', ' ')}
                        </span>
                      </div>
                      {completedAt && (
                        <div>
                          <span className="text-gray-500">Completed:</span>
                          <span className="ml-2 font-medium">
                            {completedAt.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Achievement Summary */}
        {hasCertificate() && (
          <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-8 text-white text-center slide-in">
            <Trophy className="w-16 h-16 mx-auto mb-4 badge-glow" />
            <h3 className="text-2xl font-bold mb-2">🎉 Congratulations!</h3>
            <p className="text-lg mb-4">
              You have successfully completed all training modules and earned your certification!
            </p>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block">
              <p className="font-semibold">Waste Management Certification</p>
              <p className="text-sm opacity-90">Valid for 2 years from completion date</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};