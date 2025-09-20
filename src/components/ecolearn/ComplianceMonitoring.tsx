import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Search, Filter, Camera, MapPin, AlertTriangle, CheckCircle, Clock, Upload, Eye, MessageSquare } from 'lucide-react';
import { useGreenChampions, ComplianceReport } from '../../contexts/ecolearn/GreenChampionsContext';

interface ComplianceMonitoringProps {
  onBack: () => void;
}

export const ComplianceMonitoring: React.FC<ComplianceMonitoringProps> = ({ onBack }) => {
  const { reports, champions, submitReport, updateReport, escalateReport } = useGreenChampions();
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'violation' | 'inspection' | 'survey' | 'awareness'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'reported' | 'investigating' | 'resolved' | 'escalated'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newReport, setNewReport] = useState({
    type: 'violation' as ComplianceReport['type'],
    category: 'sorting' as ComplianceReport['category'],
    severity: 'medium' as ComplianceReport['severity'],
    address: '',
    ward: '',
    zone: '',
    description: '',
    photos: [] as string[]
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    return matchesSearch && matchesType && matchesStatus && matchesSeverity;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'text-blue-600 bg-blue-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'escalated': return 'text-red-600 bg-red-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'violation': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'inspection': return <Eye className="w-5 h-5 text-blue-500" />;
      case 'survey': return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'awareness': return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleCreateReport = () => {
    if (!newReport.address || !newReport.ward || !newReport.zone || !newReport.description) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, we'd get the current user's ID
    const currentChampion = champions[0]; // Mock current user

    submitReport({
      reporterId: currentChampion.id,
      reporterName: currentChampion.name,
      type: newReport.type,
      category: newReport.category,
      severity: newReport.severity,
      status: 'reported',
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Mock coordinates
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: newReport.address,
        ward: newReport.ward,
        zone: newReport.zone
      },
      description: newReport.description,
      photos: newReport.photos,
      reportDate: new Date(),
      followUpRequired: newReport.severity === 'high' || newReport.severity === 'critical',
      impactScore: newReport.severity === 'critical' ? 10 : 
                   newReport.severity === 'high' ? 8 :
                   newReport.severity === 'medium' ? 5 : 3
    });

    setShowCreateModal(false);
    setNewReport({
      type: 'violation',
      category: 'sorting',
      severity: 'medium',
      address: '',
      ward: '',
      zone: '',
      description: '',
      photos: []
    });
  };

  const handleStatusUpdate = (reportId: string, newStatus: ComplianceReport['status']) => {
    const updates: Partial<ComplianceReport> = { status: newStatus };
    
    if (newStatus === 'resolved' || newStatus === 'closed') {
      updates.resolutionDate = new Date();
      updates.resolutionNotes = 'Issue resolved by assigned team';
    }

    updateReport(reportId, updates);
  };

  const handleEscalate = (reportId: string) => {
    escalateReport(reportId, 'Municipal Enforcement Team');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, you'd upload these files and get URLs back
      const newPhotos = Array.from(files).map(file => `photo_${Date.now()}_${file.name}`);
      setNewReport(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
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
            <span>Back to Green Champions</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Compliance Monitoring
              </h1>
              <p className="text-gray-600">
                Digital tools for inspections, violations, and community reporting
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Report</span>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Under Investigation</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reports.filter(r => r.status === 'investigating').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.status === 'resolved').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">
                    {reports.filter(r => r.severity === 'critical').length}
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
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="violation">Violations</option>
              <option value="inspection">Inspections</option>
              <option value="survey">Surveys</option>
              <option value="awareness">Awareness</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="reported">Reported</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
            
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </header>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 slide-in">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="p-6">
                {/* Report Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(report.type)}
                    <div>
                      <h3 className="font-bold text-gray-800">Report #{report.id}</h3>
                      <p className="text-sm text-gray-600">{report.reporterName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                      {report.severity}
                    </span>
                  </div>
                </div>

                {/* Report Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700 line-clamp-2">{report.location.address}</span>
                  </div>
                  
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      report.category === 'sorting' ? 'bg-blue-100 text-blue-700' :
                      report.category === 'disposal' ? 'bg-green-100 text-green-700' :
                      report.category === 'littering' ? 'bg-yellow-100 text-yellow-700' :
                      report.category === 'illegal_dumping' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3">{report.description}</p>
                </div>

                {/* Photos */}
                {report.photos.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Camera className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{report.photos.length} photo{report.photos.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex space-x-2">
                      {report.photos.slice(0, 3).map((photo, index) => (
                        <div key={index} className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                          <Camera className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                      {report.photos.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{report.photos.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-500 mb-4">
                  <p>Reported: {report.reportDate.toLocaleDateString()}</p>
                  <p>Impact Score: {report.impactScore}/10</p>
                  {report.assignedTo && <p>Assigned to: {report.assignedTo}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {report.status === 'reported' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(report.id, 'investigating');
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Investigate
                    </button>
                  )}
                  {report.status === 'investigating' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(report.id, 'resolved');
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEscalate(report.id);
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Escalate
                      </button>
                    </>
                  )}
                  {(report.status === 'resolved' || report.status === 'escalated') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(report.id, 'closed');
                      }}
                      className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Close Case
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Report Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Submit New Report</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Report Type & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Report Type *</label>
                      <select
                        value={newReport.type}
                        onChange={(e) => setNewReport(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="violation">Violation</option>
                        <option value="inspection">Inspection</option>
                        <option value="survey">Survey</option>
                        <option value="awareness">Awareness</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={newReport.category}
                        onChange={(e) => setNewReport(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="sorting">Waste Sorting</option>
                        <option value="disposal">Improper Disposal</option>
                        <option value="littering">Littering</option>
                        <option value="illegal_dumping">Illegal Dumping</option>
                        <option value="bin_overflow">Bin Overflow</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity *</label>
                    <select
                      value={newReport.severity}
                      onChange={(e) => setNewReport(prev => ({ ...prev, severity: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low - Minor issue</option>
                      <option value="medium">Medium - Moderate concern</option>
                      <option value="high">High - Significant problem</option>
                      <option value="critical">Critical - Immediate action required</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      value={newReport.address}
                      onChange={(e) => setNewReport(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Full address of the incident"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ward *</label>
                      <input
                        type="text"
                        value={newReport.ward}
                        onChange={(e) => setNewReport(prev => ({ ...prev, ward: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Ward 12"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zone *</label>
                      <select
                        value={newReport.zone}
                        onChange={(e) => setNewReport(prev => ({ ...prev, zone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Zone</option>
                        <option value="North Zone">North Zone</option>
                        <option value="South Zone">South Zone</option>
                        <option value="East Zone">East Zone</option>
                        <option value="West Zone">West Zone</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={newReport.description}
                      onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Detailed description of the issue, including what you observed, when it occurred, and any relevant context"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload photos to support your report</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Choose Photos
                      </button>
                      {newReport.photos.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          {newReport.photos.length} photo{newReport.photos.length !== 1 ? 's' : ''} selected
                        </p>
                      )}
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
                    onClick={handleCreateReport}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Report Details: {selectedReport.id}
                  </h3>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Report Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reporter</label>
                      <p className="text-gray-800 font-medium">{selectedReport.reporterName}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type & Category</label>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(selectedReport.type)}
                        <span className="capitalize">{selectedReport.type}</span>
                        <span className="text-gray-400">•</span>
                        <span className="capitalize">{selectedReport.category.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status & Severity</label>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReport.status)}`}>
                          {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedReport.severity)}`}>
                          {selectedReport.severity.charAt(0).toUpperCase() + selectedReport.severity.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                      <p className="text-gray-800">{selectedReport.reportDate.toLocaleString()}</p>
                    </div>

                    {selectedReport.assignedTo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                        <p className="text-gray-800">{selectedReport.assignedTo}</p>
                      </div>
                    )}

                    {selectedReport.escalatedTo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Escalated To</label>
                        <p className="text-red-600 font-medium">{selectedReport.escalatedTo}</p>
                      </div>
                    )}
                  </div>

                  {/* Location & Impact */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                          <div>
                            <p className="text-gray-800">{selectedReport.location.address}</p>
                            <p className="text-sm text-gray-600">
                              {selectedReport.location.ward}, {selectedReport.location.zone}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedReport.location.lat.toFixed(6)}, {selectedReport.location.lng.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Impact Score</label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              selectedReport.impactScore >= 8 ? 'bg-red-500' :
                              selectedReport.impactScore >= 6 ? 'bg-orange-500' :
                              selectedReport.impactScore >= 4 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${selectedReport.impactScore * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-800">{selectedReport.impactScore}/10</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Required</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedReport.followUpRequired ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedReport.followUpRequired ? 'Yes' : 'No'}
                      </span>
                    </div>

                    {selectedReport.resolutionDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Date</label>
                        <p className="text-gray-800">{selectedReport.resolutionDate.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800">{selectedReport.description}</p>
                  </div>
                </div>

                {/* Photos */}
                {selectedReport.photos.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photos ({selectedReport.photos.length})
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedReport.photos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-200 rounded-lg border flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Notes */}
                {selectedReport.resolutionNotes && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-gray-800">{selectedReport.resolutionNotes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  {selectedReport.status === 'reported' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, 'investigating');
                        setSelectedReport(null);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Investigation
                    </button>
                  )}
                  {selectedReport.status === 'investigating' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedReport.id, 'resolved');
                          setSelectedReport(null);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => {
                          handleEscalate(selectedReport.id);
                          setSelectedReport(null);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Escalate Issue
                      </button>
                    </>
                  )}
                  {(selectedReport.status === 'resolved' || selectedReport.status === 'escalated') && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, 'closed');
                        setSelectedReport(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Close Case
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