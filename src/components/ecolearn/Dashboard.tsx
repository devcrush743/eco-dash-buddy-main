import React from 'react';
import { collection, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useFirestoreSubscribe } from '../../hooks/ecolearn/useFirestoreSubscribe';
import { BookOpen, Award, BarChart3, Recycle, Trash2, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProgress } from '../../contexts/ecolearn/ProgressContext';

interface DashboardProps {
  onModuleStart: (moduleId: string) => void;
  onViewProgress: () => void;
  onViewCertificate: () => void;
  onViewWasteCollection: () => void;
  onViewGreenChampions: () => void;
  onViewAnalytics: () => void;
  onViewFacilityManagement: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onModuleStart,
  onViewProgress,
  onViewCertificate,
  onViewWasteCollection,
  onViewGreenChampions,
  onViewAnalytics,
  onViewFacilityManagement
}) => {
  const { t } = useLanguage();
  const { moduleProgress, getOverallProgress } = useProgress();

  const reportsQuery = query(collection(db, 'reports'));
  const { data: liveCounts } = useFirestoreSubscribe(reportsQuery, (snap) => ({ totalReports: snap.size }));

  const modules = [
    {
      id: 'waste-sorting',
      title: t('wastesorting'),
      description: t('wastesortingDesc'),
      icon: Trash2,
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'recycling',
      title: t('recycling'),
      description: t('recyclingDesc'),
      icon: Recycle,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'composting',
      title: t('composting'),
      description: t('compostingDesc'),
      icon: BookOpen,
      color: 'from-amber-400 to-amber-600'
    },
    {
      id: 'hazardous-waste',
      title: t('hazardouswaste'),
      description: t('hazardouswasteDesc'),
      icon: Award,
      color: 'from-red-400 to-red-600'
    }
  ];

  const getModuleStatus = (moduleId: string) => {
    const progress = moduleProgress[moduleId];
    if (!progress) return 'notstarted';
    if (progress.completed) return 'completed';
    if (progress.currentStep > 0) return 'inprogress';
    return 'notstarted';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'inprogress': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {liveCounts && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700 mb-4">
            Live: {liveCounts.totalReports} total reports in Firestore
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('welcome')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('subtitle')}
          </p>
          
          {/* Progress Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-700">{t('overallprogress')}</span>
              <span className="text-2xl font-bold text-green-600">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Learning Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {modules.map((module) => {
            const status = getModuleStatus(module.id);
            const Icon = module.icon;
            
            return (
              <div
                key={module.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => onModuleStart(module.id)}
              >
                <div className={`h-2 bg-gradient-to-r ${module.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${module.color} text-white`}>
                      <Icon size={24} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {t(status)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105">
                      {status === 'completed' ? t('complete') : status === 'inprogress' ? t('continue') : t('start')}
                    </button>
                    {moduleProgress[module.id] && (
                      <div className="text-sm text-gray-500">
                        {Math.round((moduleProgress[module.id].currentStep / moduleProgress[module.id].totalSteps) * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <button
            onClick={onViewProgress}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 text-white">
                <BarChart3 size={24} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
              {t('viewprogress')}
            </h3>
            <p className="text-gray-600 text-sm">
              Track your learning journey
            </p>
          </button>

          <button
            onClick={onViewCertificate}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                <Award size={24} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">
              {t('certificate')}
            </h3>
            <p className="text-gray-600 text-sm">
              View your achievements
            </p>
          </button>

          <button
            onClick={onViewFacilityManagement}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                <div className="text-2xl">🏭</div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
              Facility Management
            </h3>
            <p className="text-gray-600 text-sm">
              End-to-end facility tracking and coordination
            </p>
          </button>

          <button
            onClick={onViewWasteCollection}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white">
                <Trash2 size={24} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
              Waste Collection
            </h3>
            <p className="text-gray-600 text-sm">
              Manage waste collection operations
            </p>
          </button>

          <button
            onClick={onViewGreenChampions}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white">
                <Users size={24} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
              Green Champions
            </h3>
            <p className="text-gray-600 text-sm">
              Community engagement program
            </p>
          </button>
        </div>

        {/* Analytics Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onViewAnalytics}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              View Analytics Dashboard
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};