import React, { useState, useRef } from 'react';
import { ArrowLeft, QrCode, MapPin, AlertTriangle, CheckCircle, Clock, Search, Filter, Camera, Wifi, Battery } from 'lucide-react';
import { useWasteCollection, Bin } from '../../contexts/ecolearn/WasteCollectionContext';

interface BinManagementProps {
  onBack: () => void;
}

export const BinManagement: React.FC<BinManagementProps> = ({ onBack }) => {
  const { bins, updateBin } = useWasteCollection();
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'dry' | 'wet' | 'hazardous'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'full' | 'maintenance'>('all');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedQR, setScannedQR] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bin.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || bin.type === filterType;
    const matchesStatus = filterStatus === 'all' || bin.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getBinStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'full': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'damaged': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBinTypeColor = (type: string) => {
    switch (type) {
      case 'dry': return 'from-blue-400 to-blue-600';
      case 'wet': return 'from-green-400 to-green-600';
      case 'hazardous': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getFillLevelColor = (fillLevel: number) => {
    if (fillLevel >= 90) return 'text-red-600';
    if (fillLevel >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleEmptyBin = (binId: string) => {
    updateBin(binId, {
      fillLevel: 0,
      lastEmptied: new Date(),
      status: 'active'
    });
  };

  const handleMaintenanceToggle = (binId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'maintenance' ? 'active' : 'maintenance';
    updateBin(binId, { status: newStatus });
  };

  const startQRScanner = async () => {
    setShowQRScanner(true);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Simulate QR code detection after 3 seconds
        setTimeout(() => {
          const mockQRCode = 'QR_BIN001_DRY'; // Simulate scanning BIN001
          handleQRCodeDetected(mockQRCode);
        }, 3000);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. Please enable camera permissions.');
      setShowQRScanner(false);
      setIsScanning(false);
    }
  };

  const stopQRScanner = () => {
    setShowQRScanner(false);
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleQRCodeDetected = (qrCode: string) => {
    setScannedQR(qrCode);
    setIsScanning(false);
    
    // Find bin by QR code
    const foundBin = bins.find(bin => bin.qrCode === qrCode);
    if (foundBin) {
      setSelectedBin(foundBin);
      stopQRScanner();
      alert(`QR Code scanned successfully! Found bin: ${foundBin.id}`);
    } else {
      alert(`QR Code "${qrCode}" not found in system. Please try again.`);
    }
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
            className={getFillLevelColor(percentage)}
            style={{ strokeLinecap: 'round' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${getFillLevelColor(percentage)}`}>
            {Math.round(percentage)}%
          </span>
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
            <span>Back to Collection Dashboard</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Bin Management System
              </h1>
              <p className="text-gray-600">
                QR code tracking, IoT sensors, and real-time monitoring
              </p>
            </div>
            
            <button
              onClick={startQRScanner}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <QrCode className="w-5 h-5" />
              <span>Scan QR Code</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bins..."
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
              <option value="all">All Types</option>
              <option value="dry">Dry Waste</option>
              <option value="wet">Wet Waste</option>
              <option value="hazardous">Hazardous</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="full">Full</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </header>

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">QR Code Scanner</h3>
                <button
                  onClick={stopQRScanner}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Scanning for QR code...</p>
                    </div>
                  </div>
                )}
                {scannedQR && (
                  <div className="absolute bottom-2 left-2 right-2 bg-green-500 text-white p-2 rounded text-sm">
                    Detected: {scannedQR}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 text-center">
                Point your camera at a bin's QR code to scan
                {isScanning && <span className="block text-green-600 font-medium">Scanning...</span>}
              </p>
            </div>
          </div>
        )}

        {/* Bin Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 slide-in">
          {filteredBins.map((bin) => (
            <div
              key={bin.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedBin(bin)}
            >
              <div className={`h-3 bg-gradient-to-r ${getBinTypeColor(bin.type)}`}></div>
              
              <div className="p-6">
                {/* Bin Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{bin.id}</h3>
                    <p className="text-sm text-gray-600 capitalize">{bin.type} waste</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBinStatusColor(bin.status)}`}>
                      {bin.status}
                    </span>
                  </div>
                </div>

                {/* Fill Level */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fill Level</p>
                    <p className={`text-lg font-bold ${getFillLevelColor(bin.fillLevel)}`}>
                      {bin.fillLevel}%
                    </p>
                  </div>
                  <CircularProgress percentage={bin.fillLevel} size={60} />
                </div>

                {/* Location */}
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 line-clamp-2">{bin.location.address}</p>
                </div>

                {/* Sensor Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600">Sensor Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600">85%</span>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-xs text-gray-500 mb-4">
                  Last updated: {bin.lastUpdated.toLocaleTimeString()}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {bin.fillLevel >= 80 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmptyBin(bin.id);
                      }}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Schedule Empty
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMaintenanceToggle(bin.id, bin.status);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                      bin.status === 'maintenance'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    {bin.status === 'maintenance' ? 'Mark Fixed' : 'Maintenance'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bin Details Modal */}
        {selectedBin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Bin Details: {selectedBin.id}</h3>
                  <button
                    onClick={() => setSelectedBin(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bin Type</label>
                      <div className={`inline-block px-3 py-1 rounded-full text-white text-sm bg-gradient-to-r ${getBinTypeColor(selectedBin.type)}`}>
                        {selectedBin.type.charAt(0).toUpperCase() + selectedBin.type.slice(1)} Waste
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
                      <div className="flex items-center space-x-2">
                        <QrCode className="w-5 h-5 text-gray-600" />
                        <span className="font-mono text-sm">{selectedBin.qrCode}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sensor ID</label>
                      <span className="font-mono text-sm">{selectedBin.sensorId}</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <span className="text-sm">{selectedBin.capacity} liters</span>
                    </div>
                  </div>

                  {/* Status & Metrics */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Fill Level</label>
                      <div className="flex items-center space-x-4">
                        <CircularProgress percentage={selectedBin.fillLevel} size={80} />
                        <div>
                          <div className={`text-2xl font-bold ${getFillLevelColor(selectedBin.fillLevel)}`}>
                            {selectedBin.fillLevel}%
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round((selectedBin.fillLevel / 100) * selectedBin.capacity)} / {selectedBin.capacity}L
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Emptied</label>
                      <span className="text-sm">{selectedBin.lastEmptied.toLocaleDateString()} at {selectedBin.lastEmptied.toLocaleTimeString()}</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBinStatusColor(selectedBin.status)}`}>
                        {selectedBin.status.charAt(0).toUpperCase() + selectedBin.status.slice(1)}
                      </span>
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
                        <p className="text-gray-800">{selectedBin.location.address}</p>
                        <p className="text-sm text-gray-600">
                          {selectedBin.location.lat.toFixed(6)}, {selectedBin.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => handleEmptyBin(selectedBin.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Schedule Pickup
                  </button>
                  <button
                    onClick={() => handleMaintenanceToggle(selectedBin.id, selectedBin.status)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      selectedBin.status === 'maintenance'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    {selectedBin.status === 'maintenance' ? 'Mark as Fixed' : 'Report Issue'}
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