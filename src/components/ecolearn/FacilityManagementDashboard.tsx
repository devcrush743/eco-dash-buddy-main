import React, { useState } from 'react';
import { ArrowLeft, Building2, Factory, Recycle, Zap, AlertTriangle, TrendingUp, MapPin, Clock, Users } from 'lucide-react';
import { useFacility } from '../../contexts/ecolearn/FacilityContext';

interface FacilityManagementDashboardProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const FacilityManagementDashboard: React.FC<FacilityManagementDashboardProps> = ({
  onBack,
  onNavigate
}) => {
  const { 
    facilities, 
    recyclingCenters, 
    scrapShops, 
    pickupBookings, 
    wteFacilities, 
    alerts,
    getAvailableCapacity,
    getFacilityUtilization
  } = useFacility();

  const [selectedZone, setSelectedZone] = useState<string>('all');

  const zones = ['all', 'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];

  const filteredFacilities = selectedZone === 'all' 
    ? facilities 
    : facilities.filter(f => f.location.zone === selectedZone);

  const capacityData = getAvailableCapacity();
  const utilizationData = getFacilityUtilization();
  const activeAlerts = alerts.filter(alert => !alert.resolvedAt);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');

  const systemModules = [
    {
      id: 'facility-directory',
      title: 'Facility Directory',
      description: 'Centralized directory and real-time tracking of all processing facilities',
      icon: <Building2 className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      stats: `${filteredFacilities.length} facilities monitored`,
      alerts: filteredFacilities.filter(f => f.status !== 'operational').length > 0 ? 
        `${filteredFacilities.filter(f => f.status !== 'operational').length} facilities need attention` : null
    },
    {
      id: 'recycling-centers',
      title: 'Recycling Centers',
      description: 'Digital integration and real-time updates from recycling centers',
      icon: <Recycle className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      stats: `${recyclingCenters.length} centers connected`,
      alerts: null
    },
    {
      id: 'scrap-booking',
      title: 'Scrap Shop Network',
      description: 'Online booking system for scrap dealer pickups and scheduling',
      icon: <Users className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
      stats: `${pickupBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length} active bookings`,
      alerts: pickupBookings.filter(b => b.status === 'pending').length > 5 ? 'High booking volume' : null
    },
    {
      id: 'wte-monitoring',
      title: 'WTE Facility Operations',
      description: 'Digital dashboards for waste-to-energy plant monitoring and compliance',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      stats: `${wteFacilities.length} WTE plants monitored`,
      alerts: wteFacilities.some(f => f.complianceStatus.environmental !== 'compliant') ? 
        'Compliance issues detected' : null
    },
    {
      id: 'capacity-monitoring',
      title: 'Capacity & Availability',
      description: 'Real-time visibility into facility capacity and resource allocation',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-indigo-500 to-indigo-600',
      stats: `${Math.round((capacityData.available / capacityData.total) * 100)}% capacity available`,
      alerts: (capacityData.used / capacityData.total) > 0.85 ? 'System approaching capacity limits' : null
    },
    {
      id: 'facility-analytics',
      title: 'Analytics & Reporting',
      description: 'Historical data analysis and performance insights',
      icon: <Factory className="w-8 h-8" />,
      color: 'from-teal-500 to-teal-600',
      stats: 'Real-time analytics',
      alerts: null
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'facility_update',
      message: 'Central Biomethanization Plant capacity updated to 85%',
      time: '15 minutes ago',
      icon: <Building2 className="w-5 h-5 text-blue-500" />
    },
    {
      id: 2,
      type: 'booking',
      message: 'New scrap pickup booking scheduled for tomorrow',
      time: '32 minutes ago',
      icon: <Users className="w-5 h-5 text-orange-500" />
    },
    {
      id: 3,
      type: 'wte_alert',
      message: 'Metro WTE Plant efficiency dropped to 85.2%',
      time: '1 hour ago',
      icon: <Zap className="w-5 h-5 text-purple-500" />
    },
    {
      id: 4,
      type: 'maintenance',
      message: 'East Side MRF scheduled for maintenance next week',
      time: '2 hours ago',
      icon: <Factory className="w-5 h-5 text-green-500" />
    }
  ];

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
            <span>Back to Main Dashboard</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Facility Management System
              </h1>
              <p className="text-xl text-gray-600">
                End-to-end digital tracking and coordination of waste processing infrastructure
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {zones.map(zone => (
                  <option key={zone} value={zone}>
                    {zone === 'all' ? 'All Zones' : zone}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">System Online</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Facilities</p>
                  <p className="text-2xl font-bold text-gray-800">{filteredFacilities.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">System Capacity</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.round((capacityData.used / capacityData.total) * 100)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{activeAlerts.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Operational</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredFacilities.filter(f => f.status === 'operational').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Critical Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <div className="mb-8 slide-in">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-red-800">Critical Alerts Require Attention</h3>
                  <p className="text-red-700">
                    {criticalAlerts.length} critical alert{criticalAlerts.length !== 1 ? 's' : ''} need immediate response
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('facility-alerts')}
                  className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  View Alerts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Modules */}
        <section className="mb-8 slide-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">System Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          {/* System Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">System Overview</h3>
                <p>Real-time facility status and capacity monitoring</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Capacity Overview */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">System Capacity</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Capacity</span>
                        <span className="font-medium">{capacityData.total.toLocaleString()} tons/day</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Load</span>
                        <span className="font-medium">{capacityData.used.toLocaleString()} tons/day</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Available</span>
                        <span className="font-medium text-green-600">{capacityData.available.toLocaleString()} tons/day</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                        <div
                          className="h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${(capacityData.used / capacityData.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Facility Status */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Facility Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Operational</span>
                        </div>
                        <span className="font-medium">{filteredFacilities.filter(f => f.status === 'operational').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Maintenance</span>
                        </div>
                        <span className="font-medium">{filteredFacilities.filter(f => f.status === 'maintenance').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Offline</span>
                        </div>
                        <span className="font-medium">{filteredFacilities.filter(f => f.status === 'offline').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Emergency</span>
                        </div>
                        <span className="font-medium">{filteredFacilities.filter(f => f.status === 'emergency').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white">
                <h3 className="font-bold mb-1">Recent Activities</h3>
                <p className="text-sm opacity-90">Latest system updates</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 text-white">
                <h3 className="font-bold mb-1">Quick Stats</h3>
                <p className="text-sm opacity-90">Today's performance</p>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(Object.values(utilizationData).reduce((a, b) => a + b, 0) / Object.values(utilizationData).length)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Utilization</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{recyclingCenters.length}</div>
                      <div className="text-xs text-gray-600">Recycling Centers</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{scrapShops.length}</div>
                      <div className="text-xs text-gray-600">Scrap Shops</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{wteFacilities.length}</div>
                    <div className="text-xs text-gray-600">WTE Plants</div>
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