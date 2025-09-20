import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, MapPin, Clock, Phone, Mail, AlertTriangle, CheckCircle, Settings, Plus } from 'lucide-react';
import { useFacility, ProcessingFacility } from '../../contexts/ecolearn/FacilityContext';

interface FacilityDirectoryProps {
  onBack: () => void;
}

export const FacilityDirectory: React.FC<FacilityDirectoryProps> = ({ onBack }) => {
  const { facilities, searchFacilities, updateFacility, createFacility } = useFacility();
  const [selectedFacility, setSelectedFacility] = useState<ProcessingFacility | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'biomethanization' | 'mrf' | 'composting' | 'wte' | 'recycling' | 'transfer_station'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'operational' | 'maintenance' | 'offline' | 'emergency'>('all');
  const [filterZone, setFilterZone] = useState<string>('all');

  const [newFacility, setNewFacility] = useState({
    name: '',
    type: 'mrf' as ProcessingFacility['type'],
    address: '',
    zone: '',
    manager: '',
    phone: '',
    email: '',
    capacity: 100,
    openTime: '08:00',
    closeTime: '18:00'
  });

  const zones = ['all', 'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
  const facilityTypes = ['all', 'biomethanization', 'mrf', 'composting', 'wte', 'recycling', 'transfer_station'];

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = searchTerm === '' || 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || facility.type === filterType;
    const matchesStatus = filterStatus === 'all' || facility.status === filterStatus;
    const matchesZone = filterZone === 'all' || facility.location.zone === filterZone;
    return matchesSearch && matchesType && matchesStatus && matchesZone;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'emergency': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'biomethanization': return 'from-green-400 to-green-600';
      case 'mrf': return 'from-blue-400 to-blue-600';
      case 'composting': return 'from-amber-400 to-amber-600';
      case 'wte': return 'from-purple-400 to-purple-600';
      case 'recycling': return 'from-teal-400 to-teal-600';
      case 'transfer_station': return 'from-gray-400 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'biomethanization': return '🏭';
      case 'mrf': return '🏢';
      case 'composting': return '🌱';
      case 'wte': return '⚡';
      case 'recycling': return '♻️';
      case 'transfer_station': return '🚛';
      default: return '🏭';
    }
  };

  const handleCreateFacility = () => {
    if (!newFacility.name || !newFacility.address || !newFacility.zone || !newFacility.manager) {
      alert('Please fill in all required fields');
      return;
    }

    createFacility({
      name: newFacility.name,
      type: newFacility.type,
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Mock coordinates
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: newFacility.address,
        zone: newFacility.zone
      },
      status: 'operational',
      capacity: {
        total: newFacility.capacity,
        current: 0,
        available: newFacility.capacity
      },
      operationalHours: {
        open: newFacility.openTime,
        close: newFacility.closeTime,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      contact: {
        manager: newFacility.manager,
        phone: newFacility.phone,
        email: newFacility.email
      },
      certifications: [],
      lastInspection: new Date(),
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    });

    setShowCreateModal(false);
    setNewFacility({
      name: '',
      type: 'mrf',
      address: '',
      zone: '',
      manager: '',
      phone: '',
      email: '',
      capacity: 100,
      openTime: '08:00',
      closeTime: '18:00'
    });
  };

  const handleStatusUpdate = (facilityId: string, newStatus: ProcessingFacility['status']) => {
    updateFacility(facilityId, { status: newStatus });
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
            className="text-blue-500"
            style={{ strokeLinecap: 'round' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

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
            <span>Back to Facility Management</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Facility Directory
              </h1>
              <p className="text-gray-600">
                Centralized directory and real-time tracking of all processing facilities
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Facility</span>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Facilities</p>
                  <p className="text-2xl font-bold text-gray-800">{facilities.length}</p>
                </div>
                <div className="text-3xl">🏭</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Operational</p>
                  <p className="text-2xl font-bold text-green-600">
                    {facilities.filter(f => f.status === 'operational').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Under Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {facilities.filter(f => f.status === 'maintenance').length}
                  </p>
                </div>
                <Settings className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Offline/Emergency</p>
                  <p className="text-2xl font-bold text-red-600">
                    {facilities.filter(f => f.status === 'offline' || f.status === 'emergency').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {facilityTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
              <option value="emergency">Emergency</option>
            </select>
            
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {zones.map(zone => (
                <option key={zone} value={zone}>
                  {zone === 'all' ? 'All Zones' : zone}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Facility Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 slide-in">
          {filteredFacilities.map((facility) => {
            const utilizationPercentage = (facility.capacity.current / facility.capacity.total) * 100;
            
            return (
              <div
                key={facility.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedFacility(facility)}
              >
                <div className={`h-3 bg-gradient-to-r ${getTypeColor(facility.type)}`}></div>
                
                <div className="p-6">
                  {/* Facility Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{getTypeIcon(facility.type)}</div>
                      <div>
                        <h3 className="font-bold text-gray-800">{facility.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{facility.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(facility.status)}`}>
                      {facility.status}
                    </span>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Capacity Utilization</p>
                      <p className="text-lg font-bold text-gray-800">
                        {facility.capacity.current}/{facility.capacity.total} tons/day
                      </p>
                    </div>
                    <CircularProgress percentage={utilizationPercentage} size={60} />
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-2 mb-4">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2">{facility.location.address}</p>
                      <p className="text-xs text-gray-500">{facility.location.zone}</p>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {facility.operationalHours.open} - {facility.operationalHours.close}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{facility.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{facility.contact.email}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {facility.status === 'operational' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(facility.id, 'maintenance');
                        }}
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                      >
                        Maintenance
                      </button>
                    )}
                    {facility.status === 'maintenance' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(facility.id, 'operational');
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // View details
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Facility Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Add New Facility</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facility Name *</label>
                      <input
                        type="text"
                        value={newFacility.name}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter facility name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facility Type *</label>
                      <select
                        value={newFacility.type}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="mrf">Material Recovery Facility</option>
                        <option value="biomethanization">Biomethanization Plant</option>
                        <option value="composting">Composting Facility</option>
                        <option value="wte">Waste-to-Energy Plant</option>
                        <option value="recycling">Recycling Center</option>
                        <option value="transfer_station">Transfer Station</option>
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      value={newFacility.address}
                      onChange={(e) => setNewFacility(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full address including city and postal code"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zone *</label>
                      <select
                        value={newFacility.zone}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, zone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Zone</option>
                        <option value="North Zone">North Zone</option>
                        <option value="South Zone">South Zone</option>
                        <option value="East Zone">East Zone</option>
                        <option value="West Zone">West Zone</option>
                        <option value="Central Zone">Central Zone</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (tons/day) *</label>
                      <input
                        type="number"
                        value={newFacility.capacity}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name *</label>
                      <input
                        type="text"
                        value={newFacility.manager}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, manager: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Manager full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={newFacility.phone}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1-555-0123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={newFacility.email}
                      onChange={(e) => setNewFacility(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="manager@facility.com"
                    />
                  </div>

                  {/* Operating Hours */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                      <input
                        type="time"
                        value={newFacility.openTime}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, openTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                      <input
                        type="time"
                        value={newFacility.closeTime}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, closeTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                    onClick={handleCreateFacility}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Facility
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facility Details Modal */}
        {selectedFacility && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedFacility.name}
                  </h3>
                  <button
                    onClick={() => setSelectedFacility(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(selectedFacility.type)}</span>
                        <span className="capitalize">{selectedFacility.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFacility.status)}`}>
                        {selectedFacility.status.charAt(0).toUpperCase() + selectedFacility.status.slice(1)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                      <p className="text-gray-800">{selectedFacility.contact.manager}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                      <div className="space-y-1">
                        <p className="text-gray-800">{selectedFacility.contact.phone}</p>
                        <p className="text-gray-800">{selectedFacility.contact.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Capacity & Operations */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Utilization</label>
                      <div className="flex items-center space-x-4">
                        <CircularProgress 
                          percentage={(selectedFacility.capacity.current / selectedFacility.capacity.total) * 100} 
                          size={80} 
                        />
                        <div>
                          <div className="text-2xl font-bold text-gray-800">
                            {Math.round((selectedFacility.capacity.current / selectedFacility.capacity.total) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedFacility.capacity.current}/{selectedFacility.capacity.total} tons/day
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                      <p className="text-gray-800">
                        {selectedFacility.operationalHours.open} - {selectedFacility.operationalHours.close}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedFacility.operationalHours.days.join(', ')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Inspection</label>
                      <p className="text-gray-800">{selectedFacility.lastInspection.toLocaleDateString()}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance</label>
                      <p className="text-gray-800">{selectedFacility.nextMaintenance.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="text-gray-800">{selectedFacility.location.address}</p>
                        <p className="text-sm text-gray-600">{selectedFacility.location.zone}</p>
                        <p className="text-xs text-gray-500">
                          {selectedFacility.location.lat.toFixed(6)}, {selectedFacility.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                {selectedFacility.certifications.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedFacility.certifications.map((cert, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => handleStatusUpdate(selectedFacility.id, 
                      selectedFacility.status === 'operational' ? 'maintenance' : 'operational'
                    )}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      selectedFacility.status === 'operational'
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedFacility.status === 'operational' ? 'Schedule Maintenance' : 'Resume Operations'}
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Edit Details
                  </button>
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    View Analytics
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