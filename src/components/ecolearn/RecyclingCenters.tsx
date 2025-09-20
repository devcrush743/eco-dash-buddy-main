import React, { useState } from 'react';
import { ArrowLeft, Search, Recycle, Package, TrendingUp, Clock, MapPin, Phone, Truck, Download } from 'lucide-react';
import { useFacility, RecyclingCenter } from '../../contexts/ecolearn/FacilityContext';

interface RecyclingCentersProps {
  onBack: () => void;
}

export const RecyclingCenters: React.FC<RecyclingCentersProps> = ({ onBack }) => {
  const { recyclingCenters, updateInventory } = useFacility();
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryUpdate, setInventoryUpdate] = useState({
    material: '',
    quantity: 0
  });

  const zones = ['all', 'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
  const materialTypes = ['plastic', 'paper', 'glass', 'metal', 'electronics', 'cardboard', 'aluminum'];

  const filteredCenters = recyclingCenters.filter(center => {
    const matchesSearch = searchTerm === '' || 
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = filterZone === 'all' || center.location.zone === filterZone;
    return matchesSearch && matchesZone;
  });

  const getMaterialColor = (material: string) => {
    switch (material) {
      case 'plastic': return 'bg-blue-100 text-blue-700';
      case 'paper': return 'bg-green-100 text-green-700';
      case 'glass': return 'bg-purple-100 text-purple-700';
      case 'metal': return 'bg-gray-100 text-gray-700';
      case 'electronics': return 'bg-yellow-100 text-yellow-700';
      case 'cardboard': return 'bg-orange-100 text-orange-700';
      case 'aluminum': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMaterialIcon = (material: string) => {
    switch (material) {
      case 'plastic': return '🥤';
      case 'paper': return '📄';
      case 'glass': return '🍶';
      case 'metal': return '🔩';
      case 'electronics': return '💻';
      case 'cardboard': return '📦';
      case 'aluminum': return '🥫';
      default: return '♻️';
    }
  };

  const handleInventoryUpdate = () => {
    if (!selectedCenter || !inventoryUpdate.material || inventoryUpdate.quantity <= 0) {
      alert('Please select a material and enter a valid quantity');
      return;
    }

    updateInventory(selectedCenter.id, inventoryUpdate.material, inventoryUpdate.quantity);
    setShowInventoryModal(false);
    setInventoryUpdate({ material: '', quantity: 0 });
  };

  const getTotalInventoryValue = (center: RecyclingCenter) => {
    return Object.entries(center.currentInventory).reduce((total, [material, data]) => {
      // Mock pricing for calculation
      const prices: { [key: string]: number } = {
        plastic: 0.5, paper: 0.3, glass: 0.2, metal: 1.2, electronics: 2.0, cardboard: 0.25, aluminum: 1.8
      };
      return total + (data.quantity * (prices[material] || 0.5));
    }, 0);
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
            className="text-green-500"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
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
                Recycling Centers Network
              </h1>
              <p className="text-gray-600">
                Digital integration and real-time updates from recycling centers
              </p>
            </div>
            
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">Live Updates</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Connected Centers</p>
                  <p className="text-2xl font-bold text-gray-800">{recyclingCenters.length}</p>
                </div>
                <Recycle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Inventory</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(recyclingCenters.reduce((total, center) => 
                      total + Object.values(center.currentInventory).reduce((sum, item) => sum + item.quantity, 0), 0
                    ))} tons
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Processing Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(recyclingCenters.reduce((total, center) => 
                      total + Object.values(center.processingRates).reduce((sum, rate) => sum + rate, 0), 0
                    ))} t/h
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pickup Available</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {recyclingCenters.filter(c => c.pickupAvailable).length}
                  </p>
                </div>
                <Truck className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search recycling centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {zones.map(zone => (
                <option key={zone} value={zone}>
                  {zone === 'all' ? 'All Zones' : zone}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Recycling Centers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 slide-in">
          {filteredCenters.map((center) => {
            const utilizationPercentage = (center.capacity.current / center.capacity.total) * 100;
            const totalInventory = Object.values(center.currentInventory).reduce((sum, item) => sum + item.quantity, 0);
            const inventoryValue = getTotalInventoryValue(center);
            
            return (
              <div
                key={center.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedCenter(center)}
              >
                <div className="h-3 bg-gradient-to-r from-green-400 to-blue-500"></div>
                
                <div className="p-6">
                  {/* Center Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">♻️</div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{center.name}</h3>
                        <p className="text-sm text-gray-600">{center.location.zone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {center.pickupAvailable && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Pickup Available
                        </span>
                      )}
                      {center.dropoffAvailable && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Drop-off Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Capacity & Inventory Overview */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <CircularProgress percentage={utilizationPercentage} size={60} />
                      <p className="text-sm text-gray-600 mt-2">Capacity</p>
                      <p className="text-xs text-gray-500">{center.capacity.current}/{center.capacity.total} tons</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(totalInventory)}</div>
                      <p className="text-sm text-gray-600">Total Inventory</p>
                      <p className="text-xs text-gray-500">${inventoryValue.toFixed(0)} value</p>
                    </div>
                  </div>

                  {/* Material Types */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Materials Processed:</p>
                    <div className="flex flex-wrap gap-1">
                      {center.materialTypes.map((material) => (
                        <span
                          key={material}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getMaterialColor(material)}`}
                        >
                          {getMaterialIcon(material)} {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Current Inventory Highlights */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Inventory:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(center.currentInventory).slice(0, 4).map(([material, data]) => (
                        <div key={material} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{getMaterialIcon(material)} {material}</span>
                          <span className="font-medium">{data.quantity}t</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact & Hours */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 line-clamp-1">{center.location.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {center.operationalHours.open} - {center.operationalHours.close}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{center.contact.phone}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInventoryModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Update Inventory
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Schedule pickup
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Schedule Pickup
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Update Inventory Modal */}
        {showInventoryModal && selectedCenter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Update Inventory</h3>
                  <button
                    onClick={() => setShowInventoryModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
                    <select
                      value={inventoryUpdate.material}
                      onChange={(e) => setInventoryUpdate(prev => ({ ...prev, material: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select material...</option>
                      {materialTypes.map(material => (
                        <option key={material} value={material}>
                          {getMaterialIcon(material)} {material.charAt(0).toUpperCase() + material.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (tons)</label>
                    <input
                      type="number"
                      value={inventoryUpdate.quantity}
                      onChange={(e) => setInventoryUpdate(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.0"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  {inventoryUpdate.material && selectedCenter.currentInventory[inventoryUpdate.material] && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">
                        Current {inventoryUpdate.material} inventory: {selectedCenter.currentInventory[inventoryUpdate.material].quantity} tons
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setShowInventoryModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInventoryUpdate}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center Details Modal */}
        {selectedCenter && !showInventoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedCenter.name} - Detailed View
                  </h3>
                  <button
                    onClick={() => setSelectedCenter(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Inventory Details */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Current Inventory</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedCenter.currentInventory).map(([material, data]) => (
                        <div key={material} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">{getMaterialIcon(material)}</span>
                              <span className="font-medium capitalize">{material}</span>
                            </div>
                            <span className="text-lg font-bold text-gray-800">{data.quantity} tons</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Last updated: {data.lastUpdated.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Processing rate: {selectedCenter.processingRates[material] || 0} tons/hour
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operations & Contact */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Operations</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity Utilization:</span>
                          <span className="font-medium">
                            {Math.round((selectedCenter.capacity.current / selectedCenter.capacity.total) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pickup Service:</span>
                          <span className={`font-medium ${selectedCenter.pickupAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedCenter.pickupAvailable ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Drop-off Service:</span>
                          <span className={`font-medium ${selectedCenter.dropoffAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedCenter.dropoffAvailable ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{selectedCenter.location.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{selectedCenter.contact.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {selectedCenter.operationalHours.open} - {selectedCenter.operationalHours.close}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Processing Capabilities</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedCenter.processingRates).map(([material, rate]) => (
                          <div key={material} className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-lg font-bold text-blue-600">{rate}</div>
                            <div className="text-xs text-gray-600">{material} t/h</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setShowInventoryModal(true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update Inventory
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Schedule Pickup
                  </button>
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Download className="w-4 h-4 inline mr-2" />
                    Export Report
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