import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, MapPin, Navigation, Fuel, Clock, User, Route, AlertTriangle } from 'lucide-react';
import { useWasteCollection, Vehicle } from '../../contexts/ecolearn/WasteCollectionContext';

interface VehicleTrackingProps {
  onBack: () => void;
}

export const VehicleTracking: React.FC<VehicleTrackingProps> = ({ onBack }) => {
  const { vehicles, updateVehicle } = useWasteCollection();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [mapView, setMapView] = useState<'list' | 'map'>('list');

  // Simulate real-time GPS updates
  useEffect(() => {
    const interval = setInterval(() => {
      vehicles.forEach(vehicle => {
        if (vehicle.status === 'active' || vehicle.status === 'collecting') {
          // Simulate small GPS movements
          const latOffset = (Math.random() - 0.5) * 0.001;
          const lngOffset = (Math.random() - 0.5) * 0.001;
          
          updateVehicle(vehicle.id, {
            currentLocation: {
              lat: vehicle.currentLocation.lat + latOffset,
              lng: vehicle.currentLocation.lng + lngOffset
            },
            lastUpdated: new Date()
          });
        }
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [vehicles, updateVehicle]);

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'collecting': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'idle': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'compactor': return '🚛';
      case 'tipper': return '🚚';
      case 'hazmat': return '⚠️🚐';
      default: return '🚛';
    }
  };

  const getLoadPercentage = (currentLoad: number, capacity: number) => {
    return Math.round((currentLoad / capacity) * 100);
  };

  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const CircularProgress: React.FC<{ percentage: number; size: number }> = ({ percentage, size }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
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
            className={getLoadColor(percentage)}
            style={{ strokeLinecap: 'round' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${getLoadColor(percentage)}`}>
            {percentage}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 slide-in">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Collection Dashboard</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Vehicle Tracking System
              </h1>
              <p className="text-gray-600">
                Real-time GPS monitoring and fleet management
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setMapView('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mapView === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setMapView('map')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mapView === 'map' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Map View
              </button>
            </div>
          </div>

          {/* Fleet Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-800">{vehicles.length}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {vehicles.filter(v => v.status === 'active' || v.status === 'collecting').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {vehicles.filter(v => v.status === 'maintenance').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Load</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(vehicles.reduce((acc, v) => acc + getLoadPercentage(v.currentLoad, v.capacity), 0) / vehicles.length)}%
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Fuel className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {mapView === 'list' ? (
          /* Vehicle List View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 slide-in">
            {vehicles.map((vehicle) => {
              const loadPercentage = getLoadPercentage(vehicle.currentLoad, vehicle.capacity);
              
              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <div className="p-6">
                    {/* Vehicle Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{getVehicleTypeIcon(vehicle.type)}</div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{vehicle.plateNumber}</h3>
                          <p className="text-sm text-gray-600 capitalize">{vehicle.type}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVehicleStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>

                    {/* Driver & Route */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{vehicle.driver}</span>
                      </div>
                      {vehicle.route && (
                        <div className="flex items-center space-x-2">
                          <Route className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{vehicle.route}</span>
                        </div>
                      )}
                    </div>

                    {/* Load Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Load</p>
                        <p className={`text-lg font-bold ${getLoadColor(loadPercentage)}`}>
                          {vehicle.currentLoad}kg / {vehicle.capacity}kg
                        </p>
                      </div>
                      <CircularProgress percentage={loadPercentage} size={60} />
                    </div>

                    {/* Location */}
                    <div className="flex items-start space-x-2 mb-4">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Current Location</p>
                        <p className="text-xs text-gray-500">
                          {vehicle.currentLocation.lat.toFixed(4)}, {vehicle.currentLocation.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>Updated: {vehicle.lastUpdated.toLocaleTimeString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Track vehicle action
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Track Live
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Contact driver action
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Map View */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden slide-in">
            <div className="h-96 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">Interactive Map</h3>
                <p className="text-gray-500">
                  Real-time vehicle locations would be displayed here
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center space-x-2 text-sm">
                      <div className={`w-3 h-3 rounded-full ${
                        vehicle.status === 'active' ? 'bg-green-500' :
                        vehicle.status === 'collecting' ? 'bg-blue-500' :
                        vehicle.status === 'maintenance' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-gray-700">{vehicle.plateNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Details Modal */}
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Vehicle Details: {selectedVehicle.plateNumber}
                  </h3>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getVehicleTypeIcon(selectedVehicle.type)}</span>
                        <span className="capitalize">{selectedVehicle.type}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-600" />
                        <span>{selectedVehicle.driver}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Route</label>
                      <div className="flex items-center space-x-2">
                        <Route className="w-5 h-5 text-gray-600" />
                        <span>{selectedVehicle.route || 'No route assigned'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVehicleStatusColor(selectedVehicle.status)}`}>
                        {selectedVehicle.status.charAt(0).toUpperCase() + selectedVehicle.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Load & Location */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Load</label>
                      <div className="flex items-center space-x-4">
                        <CircularProgress 
                          percentage={getLoadPercentage(selectedVehicle.currentLoad, selectedVehicle.capacity)} 
                          size={80} 
                        />
                        <div>
                          <div className={`text-2xl font-bold ${getLoadColor(getLoadPercentage(selectedVehicle.currentLoad, selectedVehicle.capacity))}`}>
                            {getLoadPercentage(selectedVehicle.currentLoad, selectedVehicle.capacity)}%
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedVehicle.currentLoad}kg / {selectedVehicle.capacity}kg
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last GPS Update</label>
                      <span className="text-sm">{selectedVehicle.lastUpdated.toLocaleString()}</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-mono">
                              {selectedVehicle.currentLocation.lat.toFixed(6)}, {selectedVehicle.currentLocation.lng.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Track Real-time
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Contact Driver
                  </button>
                  <button className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                    Send to Maintenance
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