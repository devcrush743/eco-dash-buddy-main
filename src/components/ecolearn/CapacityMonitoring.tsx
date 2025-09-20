import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, BarChart3, Clock, MapPin, Zap, RefreshCw, Download, Filter } from 'lucide-react';
import { useFacility } from '../../contexts/ecolearn/FacilityContext';

interface CapacityMonitoringProps {
  onBack: () => void;
}

export const CapacityMonitoring: React.FC<CapacityMonitoringProps> = ({ onBack }) => {
  const { 
    facilities, 
    recyclingCenters, 
    wteFacilities, 
    getAvailableCapacity, 
    getFacilityUtilization,
    getProcessingVolumes
  } = useFacility();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [forecastData, setForecastData] = useState<any>({});
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const zones = ['all', 'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];

  // Simulate real-time capacity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Generate forecast data
      const forecast = {
        nextWeek: {
          expectedLoad: Math.random() * 20 + 70, // 70-90%
          peakDays: ['Monday', 'Wednesday', 'Friday'],
          recommendedActions: [
            'Schedule additional pickups for high-capacity facilities',
            'Redistribute load to underutilized facilities',
            'Consider temporary capacity expansion'
          ]
        },
        nextMonth: {
          expectedGrowth: Math.random() * 10 + 5, // 5-15%
          seasonalFactors: 'Summer increase expected',
          capacityGaps: ['North Zone may exceed 95% capacity', 'South Zone has 30% available capacity']
        }
      };
      
      setForecastData(forecast);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const allFacilities = [...facilities, ...recyclingCenters, ...wteFacilities];
  const filteredFacilities = selectedZone === 'all' 
    ? allFacilities 
    : allFacilities.filter(f => f.location.zone === selectedZone);

  const capacityData = getAvailableCapacity();
  const utilizationData = getFacilityUtilization();
  const processingVolumes = getProcessingVolumes(selectedTimeframe);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600 bg-red-100';
    if (utilization >= 75) return 'text-yellow-600 bg-yellow-100';
    if (utilization >= 50) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  const getCapacityStatus = (utilization: number) => {
    if (utilization >= 90) return 'Critical';
    if (utilization >= 75) return 'High';
    if (utilization >= 50) return 'Moderate';
    return 'Low';
  };

  const CircularProgress: React.FC<{ 
    percentage: number; 
    size: number; 
    label: string;
    color?: string;
  }> = ({ percentage, size, label, color = 'text-blue-500' }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="text-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="progress-ring" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-gray-200"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={strokeDasharray}
              className={color}
              style={{ strokeLinecap: 'round' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-800">{Math.round(percentage)}%</span>
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        </div>
      </div>
    );
  };

  const CapacityChart: React.FC<{ data: any }> = ({ data }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([type, value]: [string, any]) => (
          <div key={type} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600 capitalize">{type}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(value / maxValue) * 100}%` }}
              ></div>
            </div>
            <div className="w-16 text-sm font-medium text-gray-800">{value.toLocaleString()}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 slide-in">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Facility Management</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Capacity & Availability Monitoring
              </h1>
              <p className="text-gray-600">
                Real-time visibility into facility capacity and resource allocation
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="daily">Daily View</option>
                <option value="weekly">Weekly View</option>
                <option value="monthly">Monthly View</option>
              </select>
              
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {zones.map(zone => (
                  <option key={zone} value={zone}>
                    {zone === 'all' ? 'All Zones' : zone}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center space-x-2 bg-indigo-100 px-4 py-2 rounded-lg">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span className="text-indigo-700 text-sm">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">System Utilization</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.round((capacityData.used / capacityData.total) * 100)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available Capacity</p>
                  <p className="text-2xl font-bold text-green-600">
                    {capacityData.available.toLocaleString()} tons
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Critical Facilities</p>
                  <p className="text-2xl font-bold text-red-600">
                    {Object.values(utilizationData).filter(u => u >= 90).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Efficiency</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(Object.values(utilizationData).reduce((a, b) => a + b, 0) / Object.values(utilizationData).length)}%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 slide-in">
          {/* Capacity Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">System Capacity Overview</h3>
                <p>Real-time capacity utilization across all facilities</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <CircularProgress
                    percentage={(capacityData.used / capacityData.total) * 100}
                    size={120}
                    label="Overall Utilization"
                    color="text-indigo-500"
                  />
                  <CircularProgress
                    percentage={(capacityData.available / capacityData.total) * 100}
                    size={120}
                    label="Available Capacity"
                    color="text-green-500"
                  />
                  <CircularProgress
                    percentage={85} // Mock efficiency
                    size={120}
                    label="System Efficiency"
                    color="text-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{capacityData.total.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Capacity (tons/day)</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{capacityData.used.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Current Load (tons/day)</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{capacityData.available.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Available (tons/day)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Volumes */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Processing Volumes</h3>
                <p>Volume breakdown by facility type ({selectedTimeframe})</p>
              </div>
              <div className="p-6">
                <CapacityChart data={processingVolumes} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Facility Status */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                <h3 className="font-bold mb-1">Facility Status</h3>
                <p className="text-sm opacity-90">Current utilization levels</p>
              </div>
              <div className="p-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredFacilities.map((facility) => {
                    const utilization = utilizationData[facility.id] || 0;
                    
                    return (
                      <div key={facility.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 text-sm">{facility.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{facility.location.zone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(utilization)}`}>
                            {Math.round(utilization)}%
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {getCapacityStatus(utilization)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Forecasting */}
            {forecastData.nextWeek && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                  <h3 className="font-bold mb-1">Capacity Forecast</h3>
                  <p className="text-sm opacity-90">Predictive analytics</p>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Next Week</h4>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Expected Load</span>
                          <span className="font-bold text-yellow-600">
                            {Math.round(forecastData.nextWeek.expectedLoad)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Peak days: {forecastData.nextWeek.peakDays.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {forecastData.nextWeek.recommendedActions.slice(0, 2).map((action: string, index: number) => (
                          <div key={index} className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                            • {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 text-white">
                <h3 className="font-bold mb-1">Capacity Alerts</h3>
                <p className="text-sm opacity-90">Critical notifications</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {Object.entries(utilizationData)
                    .filter(([_, utilization]) => utilization >= 85)
                    .slice(0, 3)
                    .map(([facilityId, utilization]) => {
                      const facility = allFacilities.find(f => f.id === facilityId);
                      return (
                        <div key={facilityId} className="border-l-4 border-red-400 pl-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-800">
                              {facility?.name || 'Unknown Facility'}
                            </span>
                            <span className="text-sm font-bold text-red-600">
                              {Math.round(utilization)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {utilization >= 90 ? 'Critical capacity reached' : 'Approaching capacity limit'}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">2 minutes ago</span>
                          </div>
                        </div>
                      );
                    })}
                  
                  {Object.entries(utilizationData).filter(([_, utilization]) => utilization >= 85).length === 0 && (
                    <div className="text-center py-4">
                      <div className="text-green-600 mb-2">✓</div>
                      <p className="text-sm text-gray-600">No critical capacity alerts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 slide-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Quick Actions</h3>
              <p className="text-sm text-gray-600">Manage capacity and optimize resource allocation</p>
            </div>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 inline mr-2" />
                Export Report
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Optimize Routes
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Configure Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};