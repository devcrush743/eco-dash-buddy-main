import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, TrendingUp, AlertTriangle, Thermometer, Wind, BarChart3, Settings, Download, RefreshCw } from 'lucide-react';
import { useFacility, WTEFacility } from '../../contexts/ecolearn/FacilityContext';

interface WTEMonitoringProps {
  onBack: () => void;
}

export const WTEMonitoring: React.FC<WTEMonitoringProps> = ({ onBack }) => {
  const { wteFacilities, updateWTEMetrics, createAlert } = useFacility();
  const [selectedFacility, setSelectedFacility] = useState<WTEFacility | null>(null);
  const [realTimeData, setRealTimeData] = useState<{ [key: string]: any }>({});
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      wteFacilities.forEach(facility => {
        // Simulate small variations in real-time data
        const variations = {
          energyOutput: {
            current: facility.energyOutput.current + (Math.random() - 0.5) * 2,
            efficiency: facility.energyOutput.efficiency + (Math.random() - 0.5) * 1
          },
          emissions: {
            co2: facility.emissions.co2 + (Math.random() - 0.5) * 20,
            nox: facility.emissions.nox + (Math.random() - 0.5) * 10,
            so2: facility.emissions.so2 + (Math.random() - 0.5) * 5,
            particulates: facility.emissions.particulates + (Math.random() - 0.5) * 2
          },
          inputMaterial: {
            totalProcessed: facility.inputMaterial.totalProcessed + (Math.random() - 0.5) * 50,
            calorificValue: facility.inputMaterial.calorificValue + (Math.random() - 0.5) * 0.5,
            moistureContent: facility.inputMaterial.moistureContent + (Math.random() - 0.5) * 2
          }
        };

        setRealTimeData(prev => ({
          ...prev,
          [facility.id]: variations
        }));

        // Check for threshold breaches and create alerts
        if (variations.energyOutput.efficiency < 80) {
          createAlert({
            facilityId: facility.id,
            facilityName: facility.name,
            type: 'efficiency',
            severity: 'medium',
            message: `Energy efficiency dropped to ${variations.energyOutput.efficiency.toFixed(1)}%`,
            acknowledged: false
          });
        }

        if (variations.emissions.nox > 200) {
          createAlert({
            facilityId: facility.id,
            facilityName: facility.name,
            type: 'compliance',
            severity: 'high',
            message: `NOx emissions exceeded threshold: ${variations.emissions.nox.toFixed(1)} mg/m³`,
            acknowledged: false
          });
        }
      });
      
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [wteFacilities, createAlert]);

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'violation': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const CircularGauge: React.FC<{ 
    value: number; 
    max: number; 
    size: number; 
    label: string;
    unit: string;
    color?: string;
  }> = ({ value, max, size, label, unit, color = 'text-blue-500' }) => {
    const percentage = Math.min((value / max) * 100, 100);
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-gray-800">{value.toFixed(1)}</span>
            <span className="text-xs text-gray-600">{unit}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{label}</p>
      </div>
    );
  };

  const getCurrentData = (facility: WTEFacility) => {
    const realTime = realTimeData[facility.id];
    if (!realTime) return facility;

    return {
      ...facility,
      energyOutput: {
        ...facility.energyOutput,
        current: Math.max(0, realTime.energyOutput.current),
        efficiency: Math.max(0, Math.min(100, realTime.energyOutput.efficiency))
      },
      emissions: {
        ...facility.emissions,
        co2: Math.max(0, realTime.emissions.co2),
        nox: Math.max(0, realTime.emissions.nox),
        so2: Math.max(0, realTime.emissions.so2),
        particulates: Math.max(0, realTime.emissions.particulates)
      },
      inputMaterial: {
        ...facility.inputMaterial,
        totalProcessed: Math.max(0, realTime.inputMaterial.totalProcessed),
        calorificValue: Math.max(0, realTime.inputMaterial.calorificValue),
        moistureContent: Math.max(0, Math.min(100, realTime.inputMaterial.moistureContent))
      }
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
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
                Waste-to-Energy Monitoring
              </h1>
              <p className="text-gray-600">
                Real-time monitoring and compliance tracking for WTE facilities
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">Live Data</span>
              </div>
              <div className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Plants</p>
                  <p className="text-2xl font-bold text-gray-800">{wteFacilities.length}</p>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Energy Output</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {wteFacilities.reduce((sum, f) => {
                      const current = getCurrentData(f);
                      return sum + current.energyOutput.current;
                    }, 0).toFixed(1)} MW
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Efficiency</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(wteFacilities.reduce((sum, f) => {
                      const current = getCurrentData(f);
                      return sum + current.energyOutput.efficiency;
                    }, 0) / wteFacilities.length).toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Compliance Issues</p>
                  <p className="text-2xl font-bold text-red-600">
                    {wteFacilities.filter(f => 
                      f.complianceStatus.environmental !== 'compliant' || 
                      f.complianceStatus.safety !== 'compliant'
                    ).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </header>

        {/* WTE Facilities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 slide-in">
          {wteFacilities.map((facility) => {
            const currentData = getCurrentData(facility);
            
            return (
              <div
                key={facility.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedFacility(currentData)}
              >
                <div className="h-3 bg-gradient-to-r from-purple-400 to-blue-500"></div>
                
                <div className="p-6">
                  {/* Facility Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-gray-800 text-xl">{facility.name}</h3>
                      <p className="text-sm text-gray-600">{facility.location.zone}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(facility.complianceStatus.environmental)}`}>
                        {facility.complianceStatus.environmental}
                      </span>
                      <span className="text-xs text-gray-500">Environmental</span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <CircularGauge
                      value={currentData.energyOutput.current}
                      max={60}
                      size={80}
                      label="Power Output"
                      unit="MW"
                      color="text-purple-500"
                    />
                    <CircularGauge
                      value={currentData.energyOutput.efficiency}
                      max={100}
                      size={80}
                      label="Efficiency"
                      unit="%"
                      color={getEfficiencyColor(currentData.energyOutput.efficiency)}
                    />
                    <CircularGauge
                      value={currentData.operationalMetrics.uptime}
                      max={100}
                      size={80}
                      label="Uptime"
                      unit="%"
                      color="text-green-500"
                    />
                  </div>

                  {/* Emissions Status */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Emissions Status</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">CO₂</span>
                          <span className="font-medium">{currentData.emissions.co2.toFixed(0)} t/day</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">NOx</span>
                          <span className={`font-medium ${currentData.emissions.nox > 200 ? 'text-red-600' : 'text-gray-800'}`}>
                            {currentData.emissions.nox.toFixed(0)} mg/m³
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">SO₂</span>
                          <span className="font-medium">{currentData.emissions.so2.toFixed(0)} mg/m³</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Particulates</span>
                          <span className="font-medium">{currentData.emissions.particulates.toFixed(0)} mg/m³</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Material */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Input Material</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Processed:</span>
                        <span className="font-medium">{currentData.inputMaterial.totalProcessed.toFixed(0)} tons/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Calorific Value:</span>
                        <span className="font-medium">{currentData.inputMaterial.calorificValue.toFixed(1)} MJ/kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Moisture Content:</span>
                        <span className="font-medium">{currentData.inputMaterial.moistureContent.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Download report
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      Report
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Settings
                      }}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4 inline mr-1" />
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Facility Details Modal */}
        {selectedFacility && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedFacility.name} - Detailed Monitoring
                  </h3>
                  <button
                    onClick={() => setSelectedFacility(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Energy Output */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-purple-600" />
                      Energy Output
                    </h4>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {selectedFacility.energyOutput.current.toFixed(1)} MW
                        </div>
                        <p className="text-sm text-gray-600">Current Output</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-800">
                            {selectedFacility.energyOutput.daily.toFixed(0)}
                          </div>
                          <p className="text-xs text-gray-600">MWh/day</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-800">
                            {selectedFacility.energyOutput.monthly.toFixed(0)}
                          </div>
                          <p className="text-xs text-gray-600">MWh/month</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getEfficiencyColor(selectedFacility.energyOutput.efficiency)}`}>
                          {selectedFacility.energyOutput.efficiency.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">Efficiency</p>
                      </div>
                    </div>
                  </div>

                  {/* Emissions Monitoring */}
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Wind className="w-5 h-5 mr-2 text-green-600" />
                      Emissions
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-white rounded">
                        <span className="text-sm font-medium">CO₂</span>
                        <span className="font-bold">{selectedFacility.emissions.co2.toFixed(0)} t/day</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded">
                        <span className="text-sm font-medium">NOx</span>
                        <span className={`font-bold ${selectedFacility.emissions.nox > 200 ? 'text-red-600' : 'text-gray-800'}`}>
                          {selectedFacility.emissions.nox.toFixed(0)} mg/m³
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded">
                        <span className="text-sm font-medium">SO₂</span>
                        <span className="font-bold">{selectedFacility.emissions.so2.toFixed(0)} mg/m³</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded">
                        <span className="text-sm font-medium">Particulates</span>
                        <span className="font-bold">{selectedFacility.emissions.particulates.toFixed(0)} mg/m³</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Last measured: {selectedFacility.emissions.lastMeasured.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                      Operations
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Uptime</span>
                        <span className="font-bold text-green-600">{selectedFacility.operationalMetrics.uptime}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Downtime</span>
                        <span className="font-bold text-red-600">{selectedFacility.operationalMetrics.downtime}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Maintenance</span>
                        <span className="font-bold text-yellow-600">{selectedFacility.operationalMetrics.maintenanceHours}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Emergency Stops</span>
                        <span className="font-bold text-gray-800">{selectedFacility.operationalMetrics.emergencyStops}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Material & Compliance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Thermometer className="w-5 h-5 mr-2 text-blue-600" />
                      Input Material Analysis
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Processed</span>
                        <span className="font-bold text-xl">{selectedFacility.inputMaterial.totalProcessed} tons/day</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Calorific Value</span>
                        <span className="font-bold">{selectedFacility.inputMaterial.calorificValue} MJ/kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Moisture Content</span>
                        <span className="font-bold">{selectedFacility.inputMaterial.moistureContent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                      Compliance Status
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Environmental</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(selectedFacility.complianceStatus.environmental)}`}>
                          {selectedFacility.complianceStatus.environmental}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Safety</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(selectedFacility.complianceStatus.safety)}`}>
                          {selectedFacility.complianceStatus.safety}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Last Audit: {selectedFacility.complianceStatus.lastAudit.toLocaleDateString()}</p>
                        <p>Next Audit: {selectedFacility.complianceStatus.nextAudit.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4 inline mr-2" />
                    Export Report
                  </button>
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Configure Alerts
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};