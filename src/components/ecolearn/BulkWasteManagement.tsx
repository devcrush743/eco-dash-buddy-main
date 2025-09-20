import React, { useState } from 'react';
import { ArrowLeft, Plus, MapPin, Calendar, AlertTriangle, CheckCircle, Clock, Camera, FileText, Truck } from 'lucide-react';
import { useWasteCollection, BulkWasteRequest } from '../../contexts/ecolearn/WasteCollectionContext';

interface BulkWasteManagementProps {
  onBack: () => void;
}

export const BulkWasteManagement: React.FC<BulkWasteManagementProps> = ({ onBack }) => {
  const { bulkRequests, vehicles, createBulkRequest, updateBulkRequest } = useWasteCollection();
  const [selectedRequest, setSelectedRequest] = useState<BulkWasteRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'scheduled' | 'collected'>('all');
  const [newRequest, setNewRequest] = useState({
    requesterName: '',
    address: '',
    wasteType: '',
    estimatedVolume: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    specialRequirements: [] as string[]
  });

  const filteredRequests = bulkRequests.filter(request => 
    filterStatus === 'all' || request.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-purple-600 bg-purple-100';
      case 'collected': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'scheduled': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'collected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleCreateRequest = () => {
    if (!newRequest.requesterName || !newRequest.address || !newRequest.wasteType || !newRequest.estimatedVolume) {
      alert('Please fill in all required fields');
      return;
    }

    createBulkRequest({
      requesterId: 'USER_' + Date.now(),
      requesterName: newRequest.requesterName,
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Mock coordinates
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: newRequest.address
      },
      wasteType: newRequest.wasteType,
      estimatedVolume: parseFloat(newRequest.estimatedVolume),
      description: newRequest.description,
      priority: newRequest.priority,
      status: 'pending',
      requestDate: new Date(),
      specialRequirements: newRequest.specialRequirements
    });

    setShowCreateModal(false);
    setNewRequest({
      requesterName: '',
      address: '',
      wasteType: '',
      estimatedVolume: '',
      description: '',
      priority: 'medium',
      specialRequirements: []
    });
  };

  const handleStatusUpdate = (requestId: string, newStatus: BulkWasteRequest['status']) => {
    const updates: Partial<BulkWasteRequest> = { status: newStatus };
    
    if (newStatus === 'scheduled') {
      updates.scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      updates.assignedVehicle = vehicles.find(v => v.type === 'tipper')?.id;
    }

    updateBulkRequest(requestId, updates);
  };

  const specialRequirementOptions = [
    'Heavy machinery access required',
    'Weekend pickup preferred',
    'Hazardous materials present',
    'Large vehicle access needed',
    'Special disposal requirements',
    'Time-sensitive collection'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
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
                Bulk Waste Management
              </h1>
              <p className="text-gray-600">
                Large generator tracking and special collections
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Request</span>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{bulkRequests.length}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {bulkRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {bulkRequests.filter(r => r.status === 'scheduled').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {bulkRequests.filter(r => r.status === 'collected').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="collected">Collected</option>
            </select>
          </div>
        </header>

        {/* Request List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 slide-in">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="p-6">
                {/* Request Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{request.requesterName}</h3>
                    <p className="text-sm text-gray-600">Request #{request.id}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                </div>

                {/* Request Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700 line-clamp-2">{request.location.address}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{request.wasteType}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">V</span>
                    </div>
                    <span className="text-sm text-gray-700">{request.estimatedVolume} m³</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      Requested: {request.requestDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                </div>

                {/* Special Requirements */}
                {request.specialRequirements && request.specialRequirements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Special Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {request.specialRequirements.slice(0, 2).map((req, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {req.length > 20 ? req.substring(0, 20) + '...' : req}
                        </span>
                      ))}
                      {request.specialRequirements.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{request.specialRequirements.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(request.id, 'approved');
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(request.id, 'rejected');
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {request.status === 'approved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(request.id, 'scheduled');
                      }}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Schedule Collection
                    </button>
                  )}
                  {request.status === 'scheduled' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(request.id, 'collected');
                      }}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Mark Collected
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">New Bulk Waste Request</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Requester Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Requester Name *</label>
                      <input
                        type="text"
                        value={newRequest.requesterName}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, requesterName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Company or individual name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={newRequest.priority}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      value={newRequest.address}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Full address including city and postal code"
                    />
                  </div>

                  {/* Waste Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type *</label>
                      <input
                        type="text"
                        value={newRequest.wasteType}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, wasteType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Construction debris, Furniture, Electronics"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Volume (m³) *</label>
                      <input
                        type="number"
                        value={newRequest.estimatedVolume}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, estimatedVolume: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newRequest.description}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Detailed description of waste materials and any special considerations"
                    />
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {specialRequirementOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newRequest.specialRequirements.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRequest(prev => ({
                                  ...prev,
                                  specialRequirements: [...prev.specialRequirements, option]
                                }));
                              } else {
                                setNewRequest(prev => ({
                                  ...prev,
                                  specialRequirements: prev.specialRequirements.filter(req => req !== option)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
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
                    onClick={handleCreateRequest}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Request Details: {selectedRequest.id}
                  </h3>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Request Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                      <p className="text-gray-800 font-medium">{selectedRequest.requesterName}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedRequest.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Request Date</label>
                      <p className="text-gray-800">{selectedRequest.requestDate.toLocaleDateString()}</p>
                    </div>

                    {selectedRequest.scheduledDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                        <p className="text-gray-800">{selectedRequest.scheduledDate.toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Waste Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
                      <p className="text-gray-800">{selectedRequest.wasteType}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Volume</label>
                      <p className="text-gray-800">{selectedRequest.estimatedVolume} m³</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                          <div>
                            <p className="text-gray-800">{selectedRequest.location.address}</p>
                            <p className="text-sm text-gray-600">
                              {selectedRequest.location.lat.toFixed(6)}, {selectedRequest.location.lng.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedRequest.assignedVehicle && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Vehicle</label>
                        <div className="bg-gray-50 rounded-lg p-3">
                          {(() => {
                            const vehicle = vehicles.find(v => v.id === selectedRequest.assignedVehicle);
                            return vehicle ? (
                              <div className="flex items-center space-x-2">
                                <Truck className="w-5 h-5 text-gray-600" />
                                <div>
                                  <p className="font-medium">{vehicle.plateNumber}</p>
                                  <p className="text-sm text-gray-600">Driver: {vehicle.driver}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500">Vehicle not found</p>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Special Requirements */}
                {selectedRequest.specialRequirements && selectedRequest.specialRequirements.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.specialRequirements.map((req, index) => (
                          <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedRequest.id, 'approved');
                          setSelectedRequest(null);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Approve Request
                      </button>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedRequest.id, 'rejected');
                          setSelectedRequest(null);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject Request
                      </button>
                    </>
                  )}
                  {selectedRequest.status === 'approved' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedRequest.id, 'scheduled');
                        setSelectedRequest(null);
                      }}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Schedule Collection
                    </button>
                  )}
                  {selectedRequest.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedRequest.id, 'collected');
                        setSelectedRequest(null);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Collected
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};