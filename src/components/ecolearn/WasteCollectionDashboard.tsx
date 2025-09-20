import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, MapPin, Calendar, AlertTriangle, BarChart3, QrCode, Wifi, Navigation } from 'lucide-react';
import { useWasteCollection } from '../../contexts/ecolearn/WasteCollectionContext';

interface WasteCollectionDashboardProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const WasteCollectionDashboard: React.FC<WasteCollectionDashboardProps> = ({
  onBack,
  onNavigate
}) => {
  const { bins, vehicles, schedules, bulkRequests, getBinsByFillLevel, getVehiclesByStatus } = useWasteCollection();
  const [realTimeData, setRealTimeData] = useState({
    totalBins: bins.length,
    fullBins: getBinsByFillLevel(80).length,
    activeVehicles: getVehiclesByStatus('active').length,
    pendingSchedules: schedules.filter(s => s.status === 'scheduled').length,
    bulkRequests: bulkRequests.filter(r => r.status === 'pending').length
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealTimeData({
        totalBins: bins.length,
        fullBins: getBinsByFillLevel(80).length,
        activeVehicles: getVehiclesByStatus('active').length,
        pendingSchedules: schedules.filter(s => s.status === 'scheduled').length,
        bulkRequests: bulkRequests.filter(r => r.status === 'pending').length
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [bins, vehicles, schedules, bulkRequests, getBinsByFillLevel, getVehiclesByStatus]);

  const systemModules = [
    {
      id: 'bin-management',
      title: 'Bin Management',
      description: 'QR code tracking, IoT sensors, fill-level monitoring',
      icon: <QrCode className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      stats: `${realTimeData.totalBins} bins monitored`,
      alerts: realTimeData.fullBins > 0 ? `${realTimeData.fullBins} bins need attention` : null
    },
    {
      id: 'vehicle-tracking',
      title: 'Vehicle Tracking',
      description: 'GPS monitoring, route optimization, fleet management',
      icon: <Truck className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      stats: `${realTimeData.activeVehicles} vehicles active`,
      alerts: null
    },
    {
      id: 'scheduling',
      title: 'Smart Scheduling',
      description: 'Automated pickup scheduling, route optimization',
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      stats: `${realTimeData.pendingSchedules} scheduled pickups`,
      alerts: null
    },
    {
      id: 'bulk-waste',
      title: 'Bulk Waste Management',
      description: 'Large generator tracking, special collections',
      icon: <AlertTriangle className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
      stats: `${realTimeData.bulkRequests} pending requests`,
      alerts: realTimeData.bulkRequests > 5 ? 'High volume of requests' : null
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Bin BIN001 at 123 Main St is 95% full',
      time: '5 minutes ago',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    },
    {
      id: 2,
      type: 'warning',
      message: 'Vehicle WM-002 delayed on Route B',
      time: '12 minutes ago',
      icon: <Truck className="w-5 h-5 text-yellow-500" />
    },
    {
      id: 3,
      type: 'info',
      message: 'New bulk waste request from ABC Construction',
      time: '1 hour ago',
      icon: <MapPin className="w-5 h-5 text-blue-500" />
    }
  ];

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
            <span>Back to Training Dashboard</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Smart Waste Collection System
              </h1>
              <p className="text-xl text-gray-600">
                Integrated IoT monitoring, GPS tracking, and automated scheduling
              </p>
            </div>
            
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
              <Wifi className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">System Online</span>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bins</p>
                  <p className="text-2xl font-bold text-gray-800">{realTimeData.totalBins}</p>
                </div>
                <QrCode className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Vehicles</p>
                  <p className="text-2xl font-bold text-gray-800">{realTimeData.activeVehicles}</p>
                </div>
                <Truck className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scheduled Pickups</p>
                  <p className="text-2xl font-bold text-gray-800">{realTimeData.pendingSchedules}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Alerts</p>
                  <p className="text-2xl font-bold text-gray-800">{realTimeData.fullBins}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </header>

        {/* System Modules */}
        <section className="mb-8 slide-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">System Modules</h2>
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

        {/* Recent Alerts */}
        <section className="slide-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Alerts & Notifications</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      {alert.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className="mt-8 slide-in">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">System Performance</h3>
                <p className="text-green-100">All systems operational • Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">99.8%</div>
                  <div className="text-sm text-green-100">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">2.3s</div>
                  <div className="text-sm text-green-100">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">847</div>
                  <div className="text-sm text-green-100">Active Sensors</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};