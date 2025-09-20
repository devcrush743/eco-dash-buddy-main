import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, Users, Award, MapPin, Phone, Mail, Calendar, Star, Edit, Trash2 } from 'lucide-react';
import { useGreenChampions, GreenChampion } from '../../contexts/ecolearn/GreenChampionsContext';

interface ChampionsManagementProps {
  onBack: () => void;
}

export const ChampionsManagement: React.FC<ChampionsManagementProps> = ({ onBack }) => {
  const { champions, committees, createChampion, updateChampion } = useGreenChampions();
  const [selectedChampion, setSelectedChampion] = useState<GreenChampion | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'coordinator' | 'inspector' | 'educator' | 'reporter'>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  const [newChampion, setNewChampion] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'inspector' as GreenChampion['role'],
    committee: '',
    ward: '',
    zone: '',
    specializations: [] as string[],
    languages: [] as string[]
  });

  const zones = ['all', 'North Zone', 'South Zone', 'East Zone', 'West Zone'];
  const roles = ['all', 'coordinator', 'inspector', 'educator', 'reporter'];
  const specializationOptions = [
    'Waste Sorting', 'Composting', 'Recycling', 'Hazardous Waste',
    'Community Outreach', 'Data Collection', 'Training', 'Compliance Monitoring',
    'Education', 'Multilingual Support', 'Technology', 'Leadership'
  ];
  const languageOptions = ['English', 'Spanish', 'French', 'Mandarin', 'Portuguese', 'Arabic', 'Hindi'];

  const filteredChampions = champions.filter(champion => {
    const matchesSearch = champion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         champion.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         champion.ward.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || champion.role === filterRole;
    const matchesZone = filterZone === 'all' || champion.zone === filterZone;
    const matchesStatus = filterStatus === 'all' || champion.status === filterStatus;
    return matchesSearch && matchesRole && matchesZone && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coordinator': return 'text-purple-600 bg-purple-100';
      case 'inspector': return 'text-blue-600 bg-blue-100';
      case 'educator': return 'text-green-600 bg-green-100';
      case 'reporter': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'platinum': return 'text-purple-600';
      case 'gold': return 'text-yellow-600';
      case 'silver': return 'text-gray-600';
      case 'bronze': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const handleCreateChampion = () => {
    if (!newChampion.name || !newChampion.email || !newChampion.phone || !newChampion.ward || !newChampion.zone) {
      alert('Please fill in all required fields');
      return;
    }

    createChampion({
      name: newChampion.name,
      email: newChampion.email,
      phone: newChampion.phone,
      role: newChampion.role,
      committee: newChampion.committee,
      ward: newChampion.ward,
      zone: newChampion.zone,
      status: 'active',
      joinDate: new Date(),
      termEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      totalActivities: 0,
      completedTasks: 0,
      pendingTasks: 0,
      complianceScore: 0,
      lastActive: new Date(),
      certificationLevel: 'bronze',
      specializations: newChampion.specializations,
      languages: newChampion.languages
    });

    setShowCreateModal(false);
    setNewChampion({
      name: '',
      email: '',
      phone: '',
      role: 'inspector',
      committee: '',
      ward: '',
      zone: '',
      specializations: [],
      languages: []
    });
  };

  const handleStatusToggle = (championId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateChampion(championId, { status: newStatus });
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
            <span>Back to Green Champions</span>
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Champions Management
              </h1>
              <p className="text-gray-600">
                Recruit, onboard, and manage Green Champions across all zones
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Champion</span>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Champions</p>
                  <p className="text-2xl font-bold text-gray-800">{champions.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {champions.filter(c => c.status === 'active').length}
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
                  <p className="text-sm text-gray-600 mb-1">Avg Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(champions.reduce((acc, c) => acc + c.complianceScore, 0) / champions.length)}%
                  </p>
                </div>
                <Award className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Platinum</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {champions.filter(c => c.certificationLevel === 'platinum').length}
                  </p>
                </div>
                <Star className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search champions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            
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
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </header>

        {/* Champions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 slide-in">
          {filteredChampions.map((champion) => (
            <div
              key={champion.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedChampion(champion)}
            >
              <div className="p-6">
                {/* Champion Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {champion.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{champion.name}</h3>
                      <p className="text-sm text-gray-600">{champion.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(champion.role)}`}>
                      {champion.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(champion.status)}`}>
                      {champion.status}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">{champion.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{champion.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{champion.ward}, {champion.zone}</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getCertificationColor(champion.certificationLevel)}`}>
                      {champion.complianceScore}%
                    </div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {champion.totalActivities}
                    </div>
                    <div className="text-xs text-gray-600">Activities</div>
                  </div>
                </div>

                {/* Certification Level */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className={`w-5 h-5 ${getCertificationColor(champion.certificationLevel)}`} />
                    <span className={`text-sm font-medium ${getCertificationColor(champion.certificationLevel)}`}>
                      {champion.certificationLevel.charAt(0).toUpperCase() + champion.certificationLevel.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Active: {champion.lastActive.toLocaleDateString()}
                  </div>
                </div>

                {/* Specializations */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {champion.specializations.slice(0, 2).map((spec, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {spec}
                      </span>
                    ))}
                    {champion.specializations.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{champion.specializations.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(champion.id, champion.status);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                      champion.status === 'active'
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {champion.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit champion
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Champion Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Add New Champion</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={newChampion.name}
                        onChange={(e) => setNewChampion(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={newChampion.email}
                        onChange={(e) => setNewChampion(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={newChampion.phone}
                        onChange={(e) => setNewChampion(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        value={newChampion.role}
                        onChange={(e) => setNewChampion(prev => ({ ...prev, role: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="inspector">Inspector</option>
                        <option value="educator">Educator</option>
                        <option value="reporter">Reporter</option>
                        <option value="coordinator">Coordinator</option>
                      </select>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ward *</label>
                      <input
                        type="text"
                        value={newChampion.ward}
                        onChange={(e) => setNewChampion(prev => ({ ...prev, ward: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Ward 12"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zone *</label>
                      <select
                        value={newChampion.zone}
                        onChange={(e) => setNewChampion(prev => ({ ...prev, zone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Zone</option>
                        <option value="North Zone">North Zone</option>
                        <option value="South Zone">South Zone</option>
                        <option value="East Zone">East Zone</option>
                        <option value="West Zone">West Zone</option>
                      </select>
                    </div>
                  </div>

                  {/* Committee Assignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Committee (Optional)</label>
                    <select
                      value={newChampion.committee}
                      onChange={(e) => setNewChampion(prev => ({ ...prev, committee: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">No committee assigned</option>
                      {committees.map(committee => (
                        <option key={committee.id} value={committee.id}>
                          {committee.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specializations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {specializationOptions.map((spec) => (
                        <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newChampion.specializations.includes(spec)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewChampion(prev => ({
                                  ...prev,
                                  specializations: [...prev.specializations, spec]
                                }));
                              } else {
                                setNewChampion(prev => ({
                                  ...prev,
                                  specializations: prev.specializations.filter(s => s !== spec)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                    <div className="grid grid-cols-3 gap-2">
                      {languageOptions.map((lang) => (
                        <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newChampion.languages.includes(lang)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewChampion(prev => ({
                                  ...prev,
                                  languages: [...prev.languages, lang]
                                }));
                              } else {
                                setNewChampion(prev => ({
                                  ...prev,
                                  languages: prev.languages.filter(l => l !== lang)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">{lang}</span>
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
                    onClick={handleCreateChampion}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Champion
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Champion Details Modal */}
        {selectedChampion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Champion Details: {selectedChampion.name}
                  </h3>
                  <button
                    onClick={() => setSelectedChampion(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Champion ID</label>
                      <p className="text-gray-800 font-mono">{selectedChampion.id}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedChampion.role)}`}>
                        {selectedChampion.role.charAt(0).toUpperCase() + selectedChampion.role.slice(1)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedChampion.status)}`}>
                        {selectedChampion.status.charAt(0).toUpperCase() + selectedChampion.status.slice(1)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                      <div className="space-y-1">
                        <p className="text-gray-800">{selectedChampion.email}</p>
                        <p className="text-gray-800">{selectedChampion.phone}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-gray-800">{selectedChampion.ward}, {selectedChampion.zone}</p>
                    </div>
                  </div>

                  {/* Performance & Metrics */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certification Level</label>
                      <div className="flex items-center space-x-2">
                        <Star className={`w-6 h-6 ${getCertificationColor(selectedChampion.certificationLevel)}`} />
                        <span className={`text-lg font-bold ${getCertificationColor(selectedChampion.certificationLevel)}`}>
                          {selectedChampion.certificationLevel.charAt(0).toUpperCase() + selectedChampion.certificationLevel.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Performance Score</label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                            style={{ width: `${selectedChampion.complianceScore}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-800">{selectedChampion.complianceScore}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Activities</label>
                        <p className="text-2xl font-bold text-blue-600">{selectedChampion.totalActivities}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Completed Tasks</label>
                        <p className="text-2xl font-bold text-green-600">{selectedChampion.completedTasks}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Term Period</label>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Started: {selectedChampion.joinDate.toLocaleDateString()}</p>
                        <p>Ends: {selectedChampion.termEndDate.toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Active</label>
                      <p className="text-gray-800">{selectedChampion.lastActive.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Specializations & Languages */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedChampion.specializations.map((spec, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedChampion.languages.map((lang, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => handleStatusToggle(selectedChampion.id, selectedChampion.status)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      selectedChampion.status === 'active'
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedChampion.status === 'active' ? 'Deactivate Champion' : 'Activate Champion'}
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Edit Details
                  </button>
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    View Activities
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