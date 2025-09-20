import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Truck, AlertTriangle, CheckCircle, Route, Zap } from 'lucide-react';
import { useWasteCollection, PickupSchedule } from '../../contexts/ecolearn/WasteCollectionContext';

interface SchedulingEngineProps {
  onBack: () => void;
}

export const SchedulingEngine: React.FC<SchedulingEngineProps> = ({ onBack }) => {
  const { schedules, bins, vehicles, createSchedule, updateSchedule, getBinsByFillLevel, getOptimizedRoute } = useWasteCollection();
  const [selectedSchedule, setSelectedSchedule] = useState<PickupSchedule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [newSchedule, setNewSchedule] = useState({
    binIds: [] as string[],
    vehicleId: '',
    scheduledTime: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  // Auto-optimization engine
  useEffect(() => {
    if (autoOptimize) {
      const interval = setInterval(() => {
        // Find bins that need urgent pickup (>90% full)
        const urgentBins = getBinsByFillLevel(90);
        const availableVehicles = vehicles.filter(v => v.status === 'active' || v.status === 'idle');

        urgentBins.forEach(bin => {
          // Check if bin is already scheduled
          const isScheduled = schedules.some(schedule => 
            schedule.binIds.includes(bin.id) && 
            (schedule.status === 'scheduled' || schedule.status === 'in-progress')
          );

          if (!isScheduled && availableVehicles.length > 0) {
            // Auto-create urgent pickup
            const nearestVehicle = availableVehicles[0]; // In real app, calculate nearest
            createSchedule({
              binIds: [bin.id],
              vehicleId: nearestVehicle.id,
              scheduledTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
              estimatedDuration: 15,
              priority: 'urgent',
              status: 'scheduled',
              route: [{ lat: bin.location.lat, lng: bin.location.lng }]
            });
          }
        });
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [autoOptimize, getBinsByFillLevel, vehicles, schedules, createSchedule]);

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCreateSchedule = async () => {
    if (newSchedule.binIds.length === 0 || !newSchedule.vehicleId || !newSchedule.scheduledTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const route = await getOptimizedRoute(newSchedule.binIds);
      const estimatedDuration = newSchedule.binIds.length * 15; // 15 minutes per bin

      createSchedule({
        binIds: newSchedule.binIds,
        vehicleId: newSchedule.vehicleId,
        scheduledTime: new Date(newSchedule.scheduledTime),
        estimatedDuration,
        priority: newSchedule.priority,
        status: 'scheduled',
        route
      });

      setShowCreateModal(false);
      setNewSchedule({
        binIds: [],
        vehicleId: '',
        scheduledTime: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Error creating schedule. Please try again.');
    }
  };

  const handleStatusUpdate = (scheduleId: string, newStatus: PickupSchedule['status']) => {
    const updates: Partial<PickupSchedule> = { status: newStatus };
    
    if (newStatus === 'in-progress') {
      updates.actualStartTime = new Date();
    } else if (newStatus === 'completed') {
      updates.actualEndTime = new Date();
    }

    updateSchedule(scheduleId, updates);
  };

  const getScheduleEfficiency = () => {
    const completed = schedules.filter(s => s.status === 'completed').length;
    const total = schedules.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getAverageDelay = () => {
    const completedSchedules = schedules.filter(s => s.status === 'completed' && s.actualEndTime && s.actualStartTime);
    if (completedSchedules.length === 0) return 0;

    const totalDelay = completedSchedules.reduce((acc, schedule) => {
      const planned = schedule.estimatedDuration * 60 * 1000; // Convert to milliseconds
      const actual = schedule.actualEndTime!.getTime() - schedule.actualStartTime!.getTime();
      return acc + Math.max(0, actual - planned);
    }, 0);

    return Math.round(totalDelay / completedSchedules.length / 60000); // Convert back to minutes
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
            <span>Back to Collection Dashboard</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Smart Scheduling Engine
              </h1>
              <p className="text-gray-600">
                AI-powered pickup optimization and route planning
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className={`w-5 h-5 ${autoOptimize ? 'text-green-500' : 'text-gray-400'}`} />
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoOptimize}
                    onChange={(e) => setAutoOptimize(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Auto-Optimize</span>
                </label>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Schedule
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Schedules</p>
                  <p className="text-2xl font-bold text-gray-800">{schedules.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">{getScheduleEfficiency()}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Delay</p>
                  <p className="text-2xl font-bold text-yellow-600">{getAverageDelay()}min</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Routes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {schedules.filter(s => s.status === 'in-progress').length}
                  </p>
                </div>
                <Route className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Schedule List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 slide-in">
          {schedules.map((schedule) => {
            const vehicle = vehicles.find(v => v.id === schedule.vehicleId);
            const scheduleBins = bins.filter(b => schedule.binIds.includes(b.id));
            
            return (
              <div
                key={schedule.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedSchedule(schedule)}
              >
                <div className="p-6">
                  {/* Schedule Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Schedule {schedule.id}</h3>
                      <p className="text-sm text-gray-600">{vehicle?.plateNumber || 'Unknown Vehicle'}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScheduleStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
                        {schedule.priority}
                      </span>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {schedule.scheduledTime.toLocaleDateString()} at {schedule.scheduledTime.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        Est. {schedule.estimatedDuration} minutes
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {schedule.binIds.length} bin{schedule.binIds.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Bin List */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Bins to collect:</p>
                    <div className="flex flex-wrap gap-1">
                      {scheduleBins.map(bin => (
                        <span
                          key={bin.id}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            bin.type === 'dry' ? 'bg-blue-100 text-blue-700' :
                            bin.type === 'wet' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {bin.id} ({bin.fillLevel}%)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {schedule.status === 'scheduled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(schedule.id, 'in-progress');
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Start
                      </button>
                    )}
                    {schedule.status === 'in-progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(schedule.id, 'completed');
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // View route details
                      }}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      View Route
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Schedule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Create New Schedule</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Bin Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Bins</label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      {bins.map(bin => (
                        <label key={bin.id} className="flex items-center space-x-2 mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newSchedule.binIds.includes(bin.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewSchedule(prev => ({
                                  ...prev,
                                  binIds: [...prev.binIds, bin.id]
                                }));
                              } else {
                                setNewSchedule(prev => ({
                                  ...prev,
                                  binIds: prev.binIds.filter(id => id !== bin.id)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {bin.id} - {bin.type} ({bin.fillLevel}% full)
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
                    <select
                      value={newSchedule.vehicleId}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, vehicleId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Choose a vehicle...</option>
                      {vehicles.filter(v => v.status === 'active' || v.status === 'idle').map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.plateNumber} - {vehicle.type} ({vehicle.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Scheduled Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
                    <input
                      type="datetime-local"
                      value={newSchedule.scheduledTime}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newSchedule.priority}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSchedule}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Details Modal */}
        {selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Schedule Details: {selectedSchedule.id}
                  </h3>
                  <button
                    onClick={() => setSelectedSchedule(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Schedule Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScheduleStatusColor(selectedSchedule.status)}`}>
                        {selectedSchedule.status.charAt(0).toUpperCase() + selectedSchedule.status.slice(1)}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedSchedule.priority)}`}>
                        {selectedSchedule.priority.charAt(0).toUpperCase() + selectedSchedule.priority.slice(1)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
                      <span className="text-sm">{selectedSchedule.scheduledTime.toLocaleString()}</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
                      <span className="text-sm">{selectedSchedule.estimatedDuration} minutes</span>
                    </div>
                  </div>

                  {/* Vehicle & Route Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Vehicle</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {(() => {
                          const vehicle = vehicles.find(v => v.id === selectedSchedule.vehicleId);
                          return vehicle ? (
                            <div>
                              <p className="font-medium">{vehicle.plateNumber}</p>
                              <p className="text-sm text-gray-600">Driver: {vehicle.driver}</p>
                              <p className="text-sm text-gray-600">Type: {vehicle.type}</p>
                            </div>
                          ) : (
                            <p className="text-gray-500">Vehicle not found</p>
                          );
                        })()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bins to Collect</label>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {selectedSchedule.binIds.map(binId => {
                          const bin = bins.find(b => b.id === binId);
                          return bin ? (
                            <div key={binId} className="flex justify-between items-center mb-1">
                              <span className="text-sm">{bin.id}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                bin.type === 'dry' ? 'bg-blue-100 text-blue-700' :
                                bin.type === 'wet' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {bin.type} ({bin.fillLevel}%)
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timing Information */}
                {(selectedSchedule.actualStartTime || selectedSchedule.actualEndTime) && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Actual Timing</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {selectedSchedule.actualStartTime && (
                        <div>
                          <span className="text-gray-600">Started:</span>
                          <span className="ml-2">{selectedSchedule.actualStartTime.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedSchedule.actualEndTime && (
                        <div>
                          <span className="text-gray-600">Completed:</span>
                          <span className="ml-2">{selectedSchedule.actualEndTime.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  {selectedSchedule.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedSchedule.id, 'in-progress');
                        setSelectedSchedule(null);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Collection
                    </button>
                  )}
                  {selectedSchedule.status === 'in-progress' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedSchedule.id, 'completed');
                        setSelectedSchedule(null);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedSchedule.id, 'cancelled');
                      setSelectedSchedule(null);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Schedule
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