import React from 'react';
import { ArrowLeft, Download, Award, Calendar, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProgress } from '../../contexts/ecolearn/ProgressContext';

interface CertificateProps {
  onBack: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { hasCertificate, getTotalCompletedModules, moduleProgress } = useProgress();

  const handleDownloadCertificate = () => {
    // Create a printable version
    window.print();
  };

  if (!hasCertificate()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToDashboard')}</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Certificate Not Yet Available
            </h2>
            <p className="text-gray-600 mb-6">
              Complete all 4 training modules to earn your Waste Management Certification.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                Progress: {getTotalCompletedModules()}/4 modules completed
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the latest completion date
  const completionDates = Object.values(moduleProgress)
    .filter(progress => progress.completedAt)
    .map(progress => new Date(progress.completedAt!));
  
  const latestCompletion = completionDates.length > 0 
    ? new Date(Math.max(...completionDates.map(date => date.getTime())))
    : new Date();

  const validUntil = new Date(latestCompletion);
  validUntil.setFullYear(validUntil.getFullYear() + 2);

  const certificateId = `WMC-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 slide-in print:hidden">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToDashboard')}</span>
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t('certificate')}
              </h1>
              <p className="text-gray-600">
                Your official Waste Management Certification
              </p>
            </div>
            
            <button
              onClick={handleDownloadCertificate}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>{t('downloadCertificate')}</span>
            </button>
          </div>
        </header>

        {/* Certificate */}
        <div className="bg-white rounded-xl overflow-hidden slide-in certificate-border p-1">
          <div className="bg-white rounded-lg p-8 md:p-12">
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-4">
                  <Award className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                CERTIFICATE OF COMPLETION
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-green-500 to-blue-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">
                Mandatory Citizen Training Program
              </p>
            </div>

            {/* Certificate Body */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                This certifies that
              </p>
              
              <div className="border-b-2 border-gray-300 pb-2 mb-6 mx-auto max-w-md">
                <p className="text-2xl font-bold text-gray-800">
                  [Certificate Holder Name]
                </p>
              </div>
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                has successfully completed the comprehensive
              </p>
              
              <h2 className="text-2xl font-bold text-blue-600 mb-6">
                WASTE MANAGEMENT CERTIFICATION PROGRAM
              </h2>
              
              <p className="text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                demonstrating proficiency in waste sorting, composting, recycling, and hazardous waste management 
                through rigorous training and assessment.
              </p>
            </div>

            {/* Achievement Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Modules Completed
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Waste Sorting & Classification</li>
                  <li>✓ Organic Waste Composting</li>
                  <li>✓ Recycling Best Practices</li>
                  <li>✓ Hazardous Waste Management</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                  Certification Details
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Certificate ID:</span> {certificateId}
                  </p>
                  <p>
                    <span className="font-medium">{t('completionDate')}:</span> {latestCompletion.toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">{t('validUntil')}:</span> {validUntil.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="border-t-2 border-gray-200 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                <div>
                  <div className="border-b border-gray-400 pb-2 mb-2 mx-auto max-w-48">
                    <div className="h-8"></div>
                  </div>
                  <p className="text-sm text-gray-600">Program Director</p>
                  <p className="text-sm text-gray-600">Environmental Services Department</p>
                </div>
                
                <div>
                  <div className="border-b border-gray-400 pb-2 mb-2 mx-auto max-w-48">
                    <div className="h-8"></div>
                  </div>
                  <p className="text-sm text-gray-600">Date of Issue</p>
                  <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="text-center mt-8 text-sm text-gray-500">
                <p>This certificate verifies completion of mandatory citizen training requirements</p>
                <p>for waste management compliance and environmental stewardship.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 slide-in print:hidden">
          <h3 className="font-bold text-gray-800 mb-4">Certificate Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <p className="mb-2">
                <span className="font-medium">Validity Period:</span> 2 years from completion
              </p>
              <p className="mb-2">
                <span className="font-medium">Renewal Required:</span> {validUntil.toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Verification ID:</span> {certificateId}
              </p>
            </div>
            <div>
              <p className="mb-2">
                <span className="font-medium">Program Hours:</span> 8 hours of training
              </p>
              <p className="mb-2">
                <span className="font-medium">Assessment Score:</span> Passed all modules
              </p>
              <p>
                <span className="font-medium">Digital Verification:</span> Available online
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};