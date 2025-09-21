import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, CheckCircle, BookOpen, Film } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProgress } from '../../contexts/ecolearn/ProgressContext';
import { Quiz } from './Quiz';

interface LearningModuleProps {
  moduleId: string;
  onComplete: () => void;
  onBack: () => void;
}

export const LearningModule: React.FC<LearningModuleProps> = ({
  moduleId,
  onComplete,
  onBack
}) => {
  const { t } = useLanguage();
  const { moduleProgress, updateModuleProgress } = useProgress();
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const progress = moduleProgress[moduleId];

  const moduleData = {
    'waste-sorting': {
      title: t('wastesorting'),
      sections: [
        {
          title: 'Understanding Waste Categories',
          content: 'Learn about the different types of waste and how to categorize them properly. Understanding waste categories is the foundation of effective waste management.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '🗂️'
        },
        {
          title: 'Sorting Techniques',
          content: 'Master the practical techniques for sorting waste efficiently. This includes identifying materials, using proper tools, and maintaining hygiene during sorting.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '📋'
        },
        {
          title: 'Common Mistakes to Avoid',
          content: 'Discover the most common waste sorting mistakes and how to avoid them. Proper sorting prevents contamination and ensures effective recycling.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '❌'
        }
      ]
    },
    'composting': {
      title: t('composting'),
      sections: [
        {
          title: 'Introduction to Composting',
          content: 'Composting is a natural process that transforms organic waste into nutrient-rich soil amendment. Learn the basics of how composting works and its environmental benefits.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '🌱'
        },
        {
          title: 'Setting Up Your Compost',
          content: 'Learn how to set up and maintain a compost system. This includes choosing the right location, materials, and maintaining proper conditions for decomposition.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '🏗️'
        },
        {
          title: 'Monitoring and Maintenance',
          content: 'Understand how to monitor your compost and maintain optimal conditions. Learn about temperature, moisture, aeration, and troubleshooting common problems.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '🔍'
        }
      ]
    },
    'recycling': {
      title: t('recycling'),
      sections: [
        {
          title: 'Recycling Fundamentals',
          content: 'Understanding the recycling process from collection to manufacturing. Learn about different materials, recycling symbols, and the circular economy.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '♻️'
        },
        {
          title: 'Material Preparation',
          content: 'Learn how to properly prepare materials for recycling. This includes cleaning, sorting, and removing contaminants to ensure effective recycling.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '🧹'
        },
        {
          title: 'Advanced Recycling Techniques',
          content: 'Explore advanced recycling techniques and emerging technologies. Understand the future of recycling and how to maximize recycling efficiency.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '🔬'
        }
      ]
    },
    'hazardous-waste': {
      title: t('hazardous'),
      sections: [
        {
          title: 'Identifying Hazardous Materials',
          content: 'Learn to identify hazardous materials in household and workplace settings. Understanding proper identification is crucial for safe handling and disposal.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '⚠️'
        },
        {
          title: 'Safe Handling Procedures',
          content: 'Master safe handling procedures for hazardous materials. Learn about protective equipment, storage requirements, and safety protocols.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '🧤'
        },
        {
          title: 'Disposal and Transportation',
          content: 'Understand proper disposal methods and transportation requirements for hazardous waste. Learn about regulatory compliance and authorized disposal facilities.',
          videoUrl: 'https://videos.pexels.com/video-files/2260964/2260964-hd_1920_1080_30fps.mp4',
          interactiveElement: '🚛'
        }
      ]
    }
  };

  const currentModule = moduleData[moduleId as keyof typeof moduleData];
  const totalSections = currentModule.sections.length;

  useEffect(() => {
    // Mark module as in-progress when started
    if (progress.status === 'not-started') {
      updateModuleProgress(moduleId, { status: 'in-progress' });
    }
  }, [moduleId, progress.status, updateModuleProgress]);

  const handleNextSection = () => {
    const newCompletedSections = [...progress.completedSections];
    if (!newCompletedSections.includes(currentSection)) {
      newCompletedSections.push(currentSection);
    }

    const newProgress = (newCompletedSections.length / totalSections) * 100;
    
    updateModuleProgress(moduleId, {
      completedSections: newCompletedSections,
      progress: newProgress
    });

    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleQuizComplete = (score: number) => {
    updateModuleProgress(moduleId, {
      status: 'completed',
      progress: 100,
      quizScore: score,
      completedAt: new Date()
    });
    setShowQuiz(false);
    onComplete();
  };

  if (showQuiz) {
    return (
      <Quiz
        moduleId={moduleId}
        onComplete={handleQuizComplete}
        onBack={() => setShowQuiz(false)}
      />
    );
  }

  const section = currentModule.sections[currentSection];
  const isLastSection = currentSection === totalSections - 1;
  const isSectionCompleted = progress.completedSections.includes(currentSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 slide-in">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToDashboard')}</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {currentModule.title}
          </h1>
          
          {/* Progress Indicator */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">
              {currentSection + 1} of {totalSections}
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden slide-in">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="text-4xl floating-animation">
                {section.interactiveElement}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Section {currentSection + 1}</span>
                  {isSectionCompleted && (
                    <CheckCircle className="w-4 h-4 text-green-300" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Film className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Educational Video</h3>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                className="w-full h-full object-cover"
                controls
                poster="https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              >
                <source src={section.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {section.content}
              </p>
            </div>

            {/* Interactive Learning Element */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Interactive Learning Point</h4>
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{section.interactiveElement}</div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    Take a moment to reflect on this section. Consider how you can apply these concepts in your daily waste management practices.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousSection}
                disabled={currentSection === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('previousSection')}</span>
              </button>

              <div className="flex space-x-2">
                {currentModule.sections.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentSection
                        ? 'bg-blue-500'
                        : progress.completedSections.includes(index)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSection}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>{isLastSection ? t('takeQuiz') : t('nextSection')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};