import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Award } from 'lucide-react';
import { useLanguage } from '../../contexts/ecolearn/LanguageContext';
import { useProgress } from '../../contexts/ecolearn/ProgressContext';

interface QuizProps {
  moduleId: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ moduleId, onComplete, onBack }) => {
  const { t } = useLanguage();
  const { moduleProgress } = useProgress();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const quizData = {
    'waste-sorting': {
      questions: [
        {
          question: 'Which items belong in organic waste?',
          options: ['Plastic bottles', 'Food scraps', 'Glass containers', 'Metal cans'],
          correct: 1
        },
        {
          question: 'What should you do before recycling plastic containers?',
          options: ['Break them into pieces', 'Clean and rinse them', 'Leave them as is', 'Remove all labels'],
          correct: 1
        },
        {
          question: 'Which waste category does paper belong to?',
          options: ['Organic', 'Recyclable', 'Hazardous', 'General'],
          correct: 1
        }
      ]
    },
    'composting': {
      questions: [
        {
          question: 'What is the ideal carbon to nitrogen ratio for composting?',
          options: ['10:1', '20:1', '30:1', '40:1'],
          correct: 2
        },
        {
          question: 'Which material should NOT be added to a compost pile?',
          options: ['Vegetable scraps', 'Meat and dairy', 'Dry leaves', 'Grass clippings'],
          correct: 1
        },
        {
          question: 'How often should you turn your compost pile?',
          options: ['Daily', 'Weekly', 'Monthly', 'Never'],
          correct: 1
        }
      ]
    },
    'recycling': {
      questions: [
        {
          question: 'What does the recycling symbol with number 1 indicate?',
          options: ['HDPE', 'PET', 'PVC', 'PP'],
          correct: 1
        },
        {
          question: 'Which step is most important in the recycling process?',
          options: ['Collection', 'Sorting', 'Cleaning', 'All are equally important'],
          correct: 3
        },
        {
          question: 'What percentage of aluminum cans are typically recycled?',
          options: ['25%', '50%', '75%', '95%'],
          correct: 2
        }
      ]
    },
    'hazardous-waste': {
      questions: [
        {
          question: 'Which item is considered hazardous waste?',
          options: ['Used batteries', 'Cardboard boxes', 'Glass bottles', 'Paper towels'],
          correct: 0
        },
        {
          question: 'How should you dispose of paint and solvents?',
          options: ['Pour down the drain', 'Mix with regular trash', 'Take to authorized facility', 'Burn in backyard'],
          correct: 2
        },
        {
          question: 'What should you do if you spill hazardous material?',
          options: ['Clean immediately with water', 'Contain and call authorities', 'Leave it to evaporate', 'Cover with dirt'],
          correct: 1
        }
      ]
    }
  };

  const currentQuiz = quizData[moduleId as keyof typeof quizData];
  const questions = currentQuiz.questions;
  const totalQuestions = questions.length;

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    const passed = score >= 70;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden slide-in">
            <div className={`p-8 text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="mb-6">
                {passed ? (
                  <Award className="w-16 h-16 text-green-500 mx-auto mb-4 badge-glow" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {passed ? t('congratulations') : 'Try Again'}
                </h2>
                <p className="text-xl text-gray-600">
                  {passed ? t('moduleCompleted') : 'Score at least 70% to pass'}
                </p>
                <p className="text-lg text-gray-700 mb-8">
                  {question.question}
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6 inline-block">
                <div className="text-4xl font-bold text-gray-800 mb-2">{score}%</div>
                <div className="text-gray-600">
                  {selectedAnswers.filter((answer, index) => answer === questions[index].correct).length} of {totalQuestions} correct
                </div>
              </div>

              <div className="space-y-4">
                {passed ? (
                  <button
                    onClick={() => onComplete(score)}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Complete Module
                  </button>
                ) : (
                  <button
                    onClick={handleRetakeQuiz}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Retake Quiz
                  </button>
                )}
                
                <button
                  onClick={onBack}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Back to Module
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const hasSelectedAnswer = selectedAnswers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 slide-in">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Module</span>
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Knowledge Assessment</h1>
            <span className="text-gray-600">
              {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </header>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden slide-in">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {t('question')} {currentQuestion + 1}
            </h2>
            
            <p className="text-lg text-gray-700 mb-8">
              {question.question}
            </p>

            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedAnswers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswers[currentQuestion] === index && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={!hasSelectedAnswer}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {currentQuestion === totalQuestions - 1 ? t('submit') : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};