import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Leaf, Brain, Download, Filter, RefreshCw, Settings } from 'lucide-react';
import { useAnalytics } from '../../contexts/ecolearn/AnalyticsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/ecolearn/UserContext';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack }) => {
  const { 
    environmentalMetrics, 
    costBenefitAnalysis, 
    predictiveModels, 
    complianceReports,
    getWastePatterns,
    getPredictions,
    getPerformanceMetrics,
    generateComplianceReport,
    exportReport
  } = useAnalytics();
  const { t } = useLanguage();
  const { userRole } = useUser();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Real-time data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = generateComplianceReport('monthly', { zone: selectedZone });
      await exportReport(report.id, 'pdf');
      alert('Report generated and exported successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getTimeframeData = () => {
    const now = new Date();
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : selectedTimeframe === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return getPerformanceMetrics({ start: startDate, end: now });
  };

  const performanceData = getTimeframeData();
  const wastePatterns = getWastePatterns({ zone: selectedZone !== 'all' ? selectedZone : undefined });
  const binPredictions = getPredictions('bin_fill_prediction');

  // Role-based dashboard configuration
  const getDashboardConfig = () => {
    switch (userRole) {
      case 'admin':
        return {
          title: 'Executive Analytics Dashboard',
          showCostAnalysis: true,
          showPredictive: true,
          showEnvironmental: true,
          showOperational: true
        };
      case 'policymaker':
        return {
          title: 'Policy Impact Dashboard',
          showCostAnalysis: true,
          showPredictive: false,
          showEnvironmental: true,
          showOperational: false
        };
      case 'field_operator':
        return {
          title: 'Operational Dashboard',
          showCostAnalysis: false,
          showPredictive: true,
          showEnvironmental: false,
          showOperational: true
        };
      default:
        return {
          title: 'Community Impact Dashboard',
          showCostAnalysis: false,
          showPredictive: false,
          showEnvironmental: true,
          showOperational: false
        };
    }
  };

  const config = getDashboardConfig();

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 slide-in">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {config.title}
              </h1>
              <p className="text-gray-600">
                Advanced analytics and intelligence for data-driven decisions
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Zones</option>
                <option value="North Zone">North Zone</option>
                <option value="South Zone">South Zone</option>
                <option value="East Zone">East Zone</option>
                <option value="West Zone">West Zone</option>
              </select>
              
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingReport ? 'Generating...' : 'Export Report'}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4" />
                <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Key Metrics */}
        <section className="mb-8 slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Collection Efficiency"
              value={`${performanceData.collectionEfficiency}%`}
              change="+2.3%"
              icon={<BarChart3 className="w-6 h-6" />}
              color="text-blue-600"
            />
            
            {config.showEnvironmental && (
              <MetricCard
                title="CO₂ Reduction"
                value={`${environmentalMetrics.co2Reduction}kg`}
                change="+15.2%"
                icon={<Leaf className="w-6 h-6" />}
                color="text-green-600"
              />
            )}
            
            {config.showCostAnalysis && (
              <MetricCard
                title="Cost per Ton"
                value={`$${costBenefitAnalysis.costPerTonProcessed}`}
                change="-8.1%"
                icon={<DollarSign className="w-6 h-6" />}
                color="text-purple-600"
              />
            )}
            
            <MetricCard
              title="Recycling Rate"
              value={`${environmentalMetrics.recyclingRate}%`}
              change="+5.7%"
              icon={<TrendingUp className="w-6 h-6" />}
              color="text-orange-600"
            />
          </div>
        </section>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 slide-in">
          {/* Waste Generation Patterns */}
          <ChartCard title="Waste Generation Patterns">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Household Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium">65%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Commercial Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Institutional Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm font-medium">10%</span>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Environmental Impact */}
          {config.showEnvironmental && (
            <ChartCard title="Environmental Impact Metrics">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{environmentalMetrics.energySavings}</div>
                  <div className="text-sm text-gray-600">kWh Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{environmentalMetrics.waterSaved}</div>
                  <div className="text-sm text-gray-600">Liters Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{environmentalMetrics.landfillDiversion}</div>
                  <div className="text-sm text-gray-600">kg Diverted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{environmentalMetrics.wasteToEnergyConversion}</div>
                  <div className="text-sm text-gray-600">kWh Generated</div>
                </div>
              </div>
            </ChartCard>
          )}
        </div>

        {/* Predictive Analytics */}
        {config.showPredictive && (
          <section className="mb-8 slide-in">
            <ChartCard title="Predictive Analytics & AI Models">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Active Models</h4>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600">{predictiveModels.length} models running</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {predictiveModels.map((model) => (
                    <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-800">{model.name}</h5>
                        <span className="text-sm text-green-600">{model.accuracy}% accuracy</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Last trained: {model.lastTrained.toLocaleDateString()}
                      </p>
                      <div className="space-y-2">
                        {Object.entries(model.predictions).slice(0, 3).map(([key, pred]) => (
                          <div key={key} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{key}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{Math.round(pred.value)}</span>
                              <span className="text-xs text-gray-500">
                                ({Math.round(pred.confidence * 100)}% conf.)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </section>
        )}

        {/* Cost-Benefit Analysis */}
        {config.showCostAnalysis && (
          <section className="mb-8 slide-in">
            <ChartCard title="Cost-Benefit Analysis & Economic Impact">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-800">Operational Costs</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Cost</span>
                      <span className="font-medium">${costBenefitAnalysis.totalOperationalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost per Ton</span>
                      <span className="font-medium">${costBenefitAnalysis.costPerTonProcessed}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-800">Revenue Streams</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Recyclables</span>
                      <span className="font-medium text-green-600">+${costBenefitAnalysis.revenueFromRecyclables.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Energy</span>
                      <span className="font-medium text-green-600">+${costBenefitAnalysis.energyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Carbon Credits</span>
                      <span className="font-medium text-green-600">+${costBenefitAnalysis.carbonCreditValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-800">ROI Analysis</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ROI</span>
                      <span className="font-medium text-blue-600">{costBenefitAnalysis.roi}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payback Period</span>
                      <span className="font-medium">{costBenefitAnalysis.paybackPeriod} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Benefit</span>
                      <span className="font-medium text-green-600">${costBenefitAnalysis.netBenefit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </section>
        )}

        {/* Compliance Alerts */}
        <section className="slide-in">
          <ChartCard title="Automated Compliance & Performance Alerts">
            <div className="space-y-4">
              {complianceReports.slice(0, 1).map((report) => (
                <div key={report.id}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{report.metrics.collectionEfficiency}%</div>
                      <div className="text-sm text-gray-600">Collection Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{report.metrics.binUtilization}%</div>
                      <div className="text-sm text-gray-600">Bin Utilization</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{report.metrics.routeOptimization}%</div>
                      <div className="text-sm text-gray-600">Route Optimization</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{report.metrics.citizenCompliance}%</div>
                      <div className="text-sm text-gray-600">Citizen Compliance</div>
                    </div>
                  </div>
                  
                  {report.alerts.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h6 className="font-medium text-yellow-800 mb-2">Active Alerts</h6>
                      <div className="space-y-2">
                        {report.alerts.map((alert, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              alert.level === 'critical' ? 'bg-red-500' :
                              alert.level === 'high' ? 'bg-orange-500' :
                              alert.level === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}></div>
                            <span className="text-sm text-gray-700">{alert.message}</span>
                            <span className="text-xs text-gray-500">({alert.category})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {report.recommendations.length > 0 && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h6 className="font-medium text-blue-800 mb-2">AI Recommendations</h6>
                      <ul className="space-y-1">
                        {report.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ChartCard>
        </section>
      </div>
    </div>
  );
};