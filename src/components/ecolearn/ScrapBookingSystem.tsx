import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Calendar, MapPin, Phone, Star, Clock, Package, DollarSign, User, Camera } from 'lucide-react';
import { useFacility, PickupBooking, ScrapShop } from '../../contexts/ecolearn/FacilityContext';

interface ScrapBookingSystemProps {
  onBack: () => void;
}

export const ScrapBookingSystem: React.FC<ScrapBookingSystemProps> = ({ onBack }) => {
  const { scrapShops, pickupBookings, createPickupBooking, updateBookingStatus } = useFacility();
  const [selectedShop, setSelectedShop] = useState<ScrapShop | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<PickupBooking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('all');

  const [newBooking, setNewBooking] = useState({
    customerName: '',
    customerContact: '',
    address: '',
    scheduledDate: '',
    timeSlot: '10:00-12:00',
    items: [{ category: 'metal', description: '', estimatedWeight: 0, estimatedValue: 0 }]
  });

  const itemCategories = ['metal', 'electronics', 'appliances', 'automotive', 'plastic', 'paper', 'glass'];
  const timeSlots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

  const filteredBookings = pickupBookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'metal': return '🔩';
      case 'electronics': return '💻';
      case 'appliances': return '🏠';
      case 'automotive': return '🚗';
      case 'plastic': return '🥤';
      case 'paper': return '📄';
      case 'glass': return '🍶';
      default: return '📦';
    }
  };

  const handleCreateBooking = () => {
    if (!selectedShop || !newBooking.customerName || !newBooking.customerContact || !newBooking.address || !newBooking.scheduledDate) {
      alert('Please fill in all required fields');
      return;
    }

    const totalEstimatedValue = newBooking.items.reduce((sum, item) => sum + item.estimatedValue, 0);

    createPickupBooking({
      customerId: `CUST${Date.now()}`,
      customerName: newBooking.customerName,
      customerContact: newBooking.customerContact,
      scrapShopId: selectedShop.id,
      scheduledDate: new Date(newBooking.scheduledDate),
      timeSlot: newBooking.timeSlot,
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Mock coordinates
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: newBooking.address
      },
      items: newBooking.items,
      status: 'pending',
      totalEstimatedValue
    });

    setShowBookingModal(false);
    setSelectedShop(null);
    setNewBooking({
      customerName: '',
      customerContact: '',
      address: '',
      scheduledDate: '',
      timeSlot: '10:00-12:00',
      items: [{ category: 'metal', description: '', estimatedWeight: 0, estimatedValue: 0 }]
    });
  };

  const addItem = () => {
    setNewBooking(prev => ({
      ...prev,
      items: [...prev.items, { category: 'metal', description: '', estimatedWeight: 0, estimatedValue: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setNewBooking(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setNewBooking(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateEstimatedValue = (category: string, weight: number) => {
    // Mock pricing calculation based on category and weight
    const rates: { [key: string]: number } = {
      metal: 2.5, electronics: 3.0, appliances: 1.5, automotive: 2.0, plastic: 0.5, paper: 0.3, glass: 0.2
    };
    return (rates[category] || 1.0) * weight;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6">
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
                Scrap Shop Booking Network
              </h1>
              <p className="text-gray-600">
                Online booking system for scrap dealer pickups and scheduling
              </p>
            </div>
            
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Booking</span>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Shops</p>
                  <p className="text-2xl font-bold text-gray-800">{scrapShops.filter(s => s.status === 'active').length}</p>
                </div>
                <User className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Bookings</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pickupBookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Today's Pickups</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {pickupBookings.filter(b => 
                      b.scheduledDate.toDateString() === new Date().toDateString() && 
                      (b.status === 'confirmed' || b.status === 'in_progress')
                    ).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${pickupBookings.reduce((sum, b) => sum + b.totalEstimatedValue, 0).toFixed(0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 slide-in">
          {/* Scrap Shops List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 text-white">
                <h3 className="font-bold mb-1">Registered Scrap Shops</h3>
                <p className="text-sm opacity-90">Available for pickup bookings</p>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {scrapShops.map((shop) => (
                    <div
                      key={shop.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedShop(shop)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{shop.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{shop.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Owner: {shop.owner}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{shop.contact.phone}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {shop.specializations.slice(0, 3).map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                            {getCategoryIcon(spec)} {spec}
                          </span>
                        ))}
                        {shop.specializations.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{shop.specializations.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                <h3 className="font-bold mb-1">Pickup Bookings</h3>
                <p className="text-sm opacity-90">Manage and track all pickup requests</p>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const shop = scrapShops.find(s => s.id === booking.scrapShopId);
                    
                    return (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-800">{booking.customerName}</h4>
                            <p className="text-sm text-gray-600">Booking #{booking.id}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {booking.scheduledDate.toLocaleDateString()} at {booking.timeSlot}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 line-clamp-1">{booking.location.address}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{shop?.name || 'Unknown Shop'}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{booking.items.length} item(s)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 font-medium">
                                ${booking.totalEstimatedValue.toFixed(2)} estimated
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {booking.items.slice(0, 3).map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {getCategoryIcon(item.category)} {item.category} ({item.estimatedWeight}kg)
                            </span>
                          ))}
                          {booking.items.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{booking.items.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateBookingStatus(booking.id, 'confirmed');
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateBookingStatus(booking.id, 'cancelled');
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateBookingStatus(booking.id, 'in_progress');
                              }}
                              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                            >
                              Start Pickup
                            </button>
                          )}
                          {booking.status === 'in_progress' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateBookingStatus(booking.id, 'completed');
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Schedule Scrap Pickup</h3>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {!selectedShop ? (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">Select a Scrap Shop</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scrapShops.filter(s => s.status === 'active').map((shop) => (
                        <div
                          key={shop.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedShop(shop)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{shop.name}</h5>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">{shop.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Owner: {shop.owner}</p>
                          <div className="flex flex-wrap gap-1">
                            {shop.specializations.map((spec, index) => (
                              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                {getCategoryIcon(spec)} {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-medium text-orange-800 mb-2">Selected Shop: {selectedShop.name}</h4>
                      <p className="text-sm text-orange-700">Owner: {selectedShop.owner} | Rating: {selectedShop.rating}⭐</p>
                    </div>

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                        <input
                          type="text"
                          value={newBooking.customerName}
                          onChange={(e) => setNewBooking(prev => ({ ...prev, customerName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                        <input
                          type="tel"
                          value={newBooking.customerContact}
                          onChange={(e) => setNewBooking(prev => ({ ...prev, customerContact: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="+1-555-0123"
                        />
                      </div>
                    </div>

                    {/* Pickup Details */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address *</label>
                      <input
                        type="text"
                        value={newBooking.address}
                        onChange={(e) => setNewBooking(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Full address including city and postal code"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date *</label>
                        <input
                          type="date"
                          value={newBooking.scheduledDate}
                          onChange={(e) => setNewBooking(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot *</label>
                        <select
                          value={newBooking.timeSlot}
                          onChange={(e) => setNewBooking(prev => ({ ...prev, timeSlot: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {timeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">Items for Pickup *</label>
                        <button
                          onClick={addItem}
                          className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
                        >
                          Add Item
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {newBooking.items.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                                <select
                                  value={item.category}
                                  onChange={(e) => {
                                    updateItem(index, 'category', e.target.value);
                                    // Auto-calculate estimated value
                                    const newValue = calculateEstimatedValue(e.target.value, item.estimatedWeight);
                                    updateItem(index, 'estimatedValue', newValue);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                  {itemCategories.map(cat => (
                                    <option key={cat} value={cat}>
                                      {getCategoryIcon(cat)} {cat}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
                                <input
                                  type="number"
                                  value={item.estimatedWeight}
                                  onChange={(e) => {
                                    const weight = parseFloat(e.target.value) || 0;
                                    updateItem(index, 'estimatedWeight', weight);
                                    // Auto-calculate estimated value
                                    const newValue = calculateEstimatedValue(item.category, weight);
                                    updateItem(index, 'estimatedValue', newValue);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  placeholder="0"
                                  min="0"
                                  step="0.1"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Est. Value ($)</label>
                                <input
                                  type="number"
                                  value={item.estimatedValue}
                                  onChange={(e) => updateItem(index, 'estimatedValue', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              
                              <div className="flex items-end">
                                {newBooking.items.length > 1 && (
                                  <button
                                    onClick={() => removeItem(index)}
                                    className="w-full px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Brief description of the item"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">Total Estimated Value:</span>
                          <span className="text-xl font-bold text-green-600">
                            ${newBooking.items.reduce((sum, item) => sum + item.estimatedValue, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setSelectedShop(null)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Back to Shop Selection
                      </button>
                      <button
                        onClick={handleCreateBooking}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Schedule Pickup
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Booking Details: {selectedBooking.id}
                  </h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer & Booking Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                      <p className="text-gray-800 font-medium">{selectedBooking.customerName}</p>
                      <p className="text-gray-600">{selectedBooking.customerContact}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status.replace('_', ' ').charAt(0).toUpperCase() + selectedBooking.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Pickup</label>
                      <p className="text-gray-800">
                        {selectedBooking.scheduledDate.toLocaleDateString()} at {selectedBooking.timeSlot}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                      <p className="text-gray-800">{selectedBooking.location.address}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Shop</label>
                      <p className="text-gray-800">
                        {scrapShops.find(s => s.id === selectedBooking.scrapShopId)?.name || 'Unknown Shop'}
                      </p>
                    </div>
                  </div>

                  {/* Items & Value */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Items for Pickup</label>
                      <div className="space-y-2">
                        {selectedBooking.items.map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getCategoryIcon(item.category)}</span>
                                <span className="font-medium capitalize">{item.category}</span>
                              </div>
                              <span className="font-bold text-green-600">${item.estimatedValue.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                            <p className="text-xs text-gray-500">Weight: {item.estimatedWeight} kg</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">Total Estimated Value:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${selectedBooking.totalEstimatedValue.toFixed(2)}
                        </span>
                      </div>
                      {selectedBooking.actualValue && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-medium text-gray-800">Actual Value:</span>
                          <span className="text-xl font-bold text-blue-600">
                            ${selectedBooking.actualValue.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800">{selectedBooking.notes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, 'confirmed');
                          setSelectedBooking(null);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Confirm Booking
                      </button>
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, 'cancelled');
                          setSelectedBooking(null);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'in_progress');
                        setSelectedBooking(null);
                      }}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Start Pickup
                    </button>
                  )}
                  {selectedBooking.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'completed');
                        setSelectedBooking(null);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Complete Pickup
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