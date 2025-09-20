import React, { useState } from 'react';
import { ArrowLeft, Users, Award, TrendingUp, MapPin, Calendar, AlertTriangle, CheckCircle, Star, Shield } from 'lucide-react';
import { useGreenChampions } from '../../contexts/ecolearn/GreenChampionsContext';
import { useLanguage } from '../../contexts/ecolearn/LanguageContext';

interface GreenChampionsDashboardProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const GreenChampionsDashboard: React.FC<GreenChampionsDashboardProps> = ({
  onBack,
  onNavigate
}) => {
  const { champions, committees, reports, activities, metrics } = useGreenChampions();
  const { t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const zones = ['all', 'North Zone', 'South Zone', 'East Zone', 'West Zone'];

  const filteredData = {
    champions: selectedZone === 'all' ? champions : champions.filter(c => c.zone === selectedZone),
    committees: selectedZone === 'all' ? committees : committees.filter(c => c.zone === selectedZone),
    reports: selectedZone === 'all' ? reports : reports.filter(r => r.location.zone === selectedZone),
    activities: selectedZone === 'all' ? activities : activities.filter(a => {
      const champion = champions.find(c => c.id === a.championId);
      return champion && (selectedZone === 'all' || champion.zone === selectedZone);
    })
  };

  const systemModules = [
    {
      id: 'champions-management',
      title: 'Champions Management',
      description: 'Recruit, onboard, and manage Green Champions across zones',
      icon: <Users className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      stats: `${filteredData.champions.length} active champions`,
      alerts: filteredData.champions.filter(c => c.status === 'inactive').length > 0 ? 
        `${filteredData.champions.filter(c => c.status === 'inactive').length} inactive champions` : null
    },
    {
      id: 'committee-management',
      title: 'Committee Management',
      description: 'Form and coordinate area-wise waste management committees',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      stats: `${filteredData.committees.length} active committees`,
      alerts: null
    },
    {
      id: 'compliance-monitoring',
      title: 'Compliance Monitoring',
      description: 'Digital tools for inspections, violations, and reporting',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      stats: `${filteredData.reports.length} reports this month`,
      alerts: filteredData.reports.filter(r => r.status === 'escalated').length > 0 ? 
        `${filteredData.reports.filter(r => r.status === 'escalated').length} escalated cases` : null
    },
    {
      id: 'performance-analytics',
      title: 'Performance Analytics',
      description: 'Impact dashboards and community engagement metrics',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
      stats: `${metrics.complianceRate}% compliance rate`,
      alerts: null
    }
  ];

  const recentActivities = activities
    .filter(a => {
      const champion = champions.find(c => c.id === a.championId);
      return champion && (selectedZone === 'all' || champion.zone === selectedZone);
    })
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
    .slice(0, 5);

  const urgentReports = reports
    .filter(r => r.severity === 'high' || r.severity === 'critical')
    .filter(r => selectedZone === 'all' || r.location.zone === selectedZone)
    .slice(0, 3);

  const topPerformers = champions
    .filter(c => selectedZone === 'all' || c.zone === selectedZone)
    .sort((a, b) => b.complianceScore - a.complianceScore)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 slide-in">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Main Dashboard</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Green Champions Network
              </h1>
              <p className="text-xl text-gray-600">
                Community-powered waste management and sustainability enforcement
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {zones.map(zone => (
                  <option key={zone} value={zone}>
                    {zone === 'all' ? 'All Zones' : zone}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Network Active</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Champions</p>
                  <p className="text-2xl font-bold text-green-600">{filteredData.champions.filter(c => c.status === 'active').length}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Committees</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredData.committees.filter(c => c.status === 'active').length}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Reports</p>
                  <p className="text-2xl font-bold text-purple-600">{filteredData.reports.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Compliance Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedZone === 'all' ? metrics.complianceRate : 
                     metrics.regionalBreakdown[selectedZone]?.complianceRate || 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </header>

        {/* System Modules */}
        <section className="mb-8 slide-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Network Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemModules.map((module) => (
              <div
                key={module.id}
                onClick={() => onNavigate(module.id)}
                className="bg-white rounded-xl shadow-lg overflow-hidden module-card hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className={`h-2 bg-gradient-to-r ${module.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white p-3 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700">
                      {module.icon}
                    </div>
                    {module.alerts && (
                      <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                        Alert
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {module.description}
                  </p>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-700 font-medium">
                      {module.stats}
                    </div>
                    {module.alerts && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {module.alerts}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 slide-in">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Recent Champion Activities</h3>
                <p>Latest community engagement and monitoring activities</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const champion = champions.find(c => c.id === activity.championId);
                    return (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'awareness_campaign' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'inspection' ? 'bg-purple-100 text-purple-600' :
                            activity.type === 'cleanup' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.type === 'awareness_campaign' ? '📢' :
                             activity.type === 'inspection' ? '🔍' :
                             activity.type === 'cleanup' ? '🧹' : '📋'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-800">{activity.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                              activity.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                              activity.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {activity.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>👤 {champion?.name}</span>
                            <span>📅 {activity.scheduledDate.toLocaleDateString()}</span>
                            <span>👥 {activity.participants} participants</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Urgent Reports */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
                <h3 className="font-bold mb-1">Urgent Reports</h3>
                <p className="text-sm opacity-90">High priority compliance issues</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {urgentReports.map((report) => (
                    <div key={report.id} className="border-l-4 border-red-400 pl-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {report.category.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{report.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{report.location.ward}</span>
                        <span>•</span>
                        <span>{report.reportDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 text-white">
                <h3 className="font-bold mb-1">Top Performers</h3>
                <p className="text-sm opacity-90">Highest scoring champions</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {topPerformers.map((champion, index) => (
                    <div key={champion.id} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{champion.name}</span>
                          <div className="flex items-center space-x-1">
                            <Star className={`w-4 h-4 ${
                              champion.certificationLevel === 'platinum' ? 'text-purple-500' :
                              champion.certificationLevel === 'gold' ? 'text-yellow-500' :
                              champion.certificationLevel === 'silver' ? 'text-gray-400' :
                              'text-orange-400'
                            }`} />
                            <span className="text-sm text-gray-600">{champion.complianceScore}%</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {champion.role} • {champion.zone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
                <h3 className="font-bold mb-1">Environmental Impact</h3>
                <p className="text-sm opacity-90">Community achievements</p>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.environmentalImpact.wasteReduced}kg
                    </div>
                    <div className="text-sm text-gray-600">Waste Reduced</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        +{metrics.environmentalImpact.recyclingIncrease}%
                      </div>
                      <div className="text-xs text-gray-600">Recycling</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">
                        -{metrics.environmentalImpact.violationsDecreased}%
                      </div>
                      <div className="text-xs text-gray-600">Violations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};