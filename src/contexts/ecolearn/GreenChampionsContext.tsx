import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface GreenChampion {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'coordinator' | 'inspector' | 'educator' | 'reporter';
  committee: string;
  ward: string;
  zone: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: Date;
  termEndDate: Date;
  totalActivities: number;
  completedTasks: number;
  pendingTasks: number;
  complianceScore: number;
  lastActive: Date;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  specializations: string[];
  languages: string[];
}

export interface WasteCommittee {
  id: string;
  name: string;
  ward: string;
  zone: string;
  establishedDate: Date;
  chairperson: string;
  members: string[];
  status: 'active' | 'inactive' | 'forming';
  meetingSchedule: string;
  lastMeeting: Date;
  nextMeeting: Date;
  totalMembers: number;
  activeMembers: number;
  monthlyActivities: number;
  complianceRate: number;
  coverage: {
    households: number;
    businesses: number;
    publicSpaces: number;
  };
}

export interface ComplianceReport {
  id: string;
  reporterId: string;
  reporterName: string;
  type: 'violation' | 'inspection' | 'survey' | 'awareness';
  category: 'sorting' | 'disposal' | 'littering' | 'illegal_dumping' | 'bin_overflow' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'escalated' | 'closed';
  location: {
    lat: number;
    lng: number;
    address: string;
    ward: string;
    zone: string;
  };
  description: string;
  photos: string[];
  reportDate: Date;
  assignedTo?: string;
  escalatedTo?: string;
  resolutionDate?: Date;
  resolutionNotes?: string;
  followUpRequired: boolean;
  impactScore: number;
  citizenFeedback?: {
    rating: number;
    comments: string;
  };
}

export interface Activity {
  id: string;
  championId: string;
  type: 'inspection' | 'awareness_campaign' | 'training' | 'cleanup' | 'survey' | 'meeting';
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  participants: number;
  impact: {
    householdsReached: number;
    violationsFound: number;
    issuesResolved: number;
    wasteCollected: number; // in kg
  };
  photos: string[];
  notes: string;
  feedback: {
    rating: number;
    comments: string[];
  };
}

export interface PerformanceMetrics {
  totalChampions: number;
  activeChampions: number;
  totalCommittees: number;
  activeCommittees: number;
  monthlyReports: number;
  resolvedIssues: number;
  complianceRate: number;
  communityEngagement: number;
  environmentalImpact: {
    wasteReduced: number;
    recyclingIncrease: number;
    violationsDecreased: number;
  };
  regionalBreakdown: {
    [zone: string]: {
      champions: number;
      committees: number;
      complianceRate: number;
      activities: number;
    };
  };
}

interface GreenChampionsContextType {
  champions: GreenChampion[];
  committees: WasteCommittee[];
  reports: ComplianceReport[];
  activities: Activity[];
  metrics: PerformanceMetrics;
  createChampion: (champion: Omit<GreenChampion, 'id'>) => void;
  updateChampion: (championId: string, updates: Partial<GreenChampion>) => void;
  createCommittee: (committee: Omit<WasteCommittee, 'id'>) => void;
  updateCommittee: (committeeId: string, updates: Partial<WasteCommittee>) => void;
  submitReport: (report: Omit<ComplianceReport, 'id'>) => void;
  updateReport: (reportId: string, updates: Partial<ComplianceReport>) => void;
  createActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  getChampionsByZone: (zone: string) => GreenChampion[];
  getCommitteesByZone: (zone: string) => WasteCommittee[];
  getReportsByStatus: (status: ComplianceReport['status']) => ComplianceReport[];
  escalateReport: (reportId: string, escalationLevel: string) => void;
}

const GreenChampionsContext = createContext<GreenChampionsContextType | undefined>(undefined);

export const GreenChampionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Mock data - in production, this would come from APIs
  const [champions, setChampions] = useState<GreenChampion[]>([
    {
      id: 'GC001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0101',
      role: 'coordinator',
      committee: 'COM001',
      ward: 'Ward 12',
      zone: 'North Zone',
      status: 'active',
      joinDate: new Date('2024-01-15'),
      termEndDate: new Date('2025-01-15'),
      totalActivities: 45,
      completedTasks: 42,
      pendingTasks: 3,
      complianceScore: 94,
      lastActive: new Date(),
      certificationLevel: 'gold',
      specializations: ['Waste Sorting', 'Community Outreach'],
      languages: ['English', 'Spanish']
    },
    {
      id: 'GC002',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1-555-0102',
      role: 'inspector',
      committee: 'COM001',
      ward: 'Ward 12',
      zone: 'North Zone',
      status: 'active',
      joinDate: new Date('2024-02-01'),
      termEndDate: new Date('2025-02-01'),
      totalActivities: 38,
      completedTasks: 35,
      pendingTasks: 3,
      complianceScore: 89,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      certificationLevel: 'silver',
      specializations: ['Compliance Monitoring', 'Data Collection'],
      languages: ['English', 'Mandarin']
    },
    {
      id: 'GC003',
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@email.com',
      phone: '+1-555-0103',
      role: 'educator',
      committee: 'COM002',
      ward: 'Ward 15',
      zone: 'South Zone',
      status: 'active',
      joinDate: new Date('2024-01-20'),
      termEndDate: new Date('2025-01-20'),
      totalActivities: 52,
      completedTasks: 48,
      pendingTasks: 4,
      complianceScore: 96,
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      certificationLevel: 'platinum',
      specializations: ['Education', 'Training', 'Multilingual Support'],
      languages: ['English', 'Spanish', 'Portuguese']
    }
  ]);

  const [committees, setCommittees] = useState<WasteCommittee[]>([
    {
      id: 'COM001',
      name: 'North Zone Waste Management Committee',
      ward: 'Ward 12',
      zone: 'North Zone',
      establishedDate: new Date('2024-01-01'),
      chairperson: 'GC001',
      members: ['GC001', 'GC002'],
      status: 'active',
      meetingSchedule: 'First Monday of every month',
      lastMeeting: new Date('2024-12-02'),
      nextMeeting: new Date('2025-01-06'),
      totalMembers: 8,
      activeMembers: 7,
      monthlyActivities: 15,
      complianceRate: 87,
      coverage: {
        households: 450,
        businesses: 23,
        publicSpaces: 8
      }
    },
    {
      id: 'COM002',
      name: 'South Zone Environmental Committee',
      ward: 'Ward 15',
      zone: 'South Zone',
      establishedDate: new Date('2024-01-15'),
      chairperson: 'GC003',
      members: ['GC003'],
      status: 'active',
      meetingSchedule: 'Second Saturday of every month',
      lastMeeting: new Date('2024-12-14'),
      nextMeeting: new Date('2025-01-11'),
      totalMembers: 6,
      activeMembers: 6,
      monthlyActivities: 12,
      complianceRate: 92,
      coverage: {
        households: 380,
        businesses: 18,
        publicSpaces: 6
      }
    }
  ]);

  const [reports, setReports] = useState<ComplianceReport[]>([
    {
      id: 'RPT001',
      reporterId: 'GC002',
      reporterName: 'Michael Chen',
      type: 'violation',
      category: 'sorting',
      severity: 'medium',
      status: 'investigating',
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: '123 Main Street, Ward 12',
        ward: 'Ward 12',
        zone: 'North Zone'
      },
      description: 'Improper waste sorting observed at residential complex. Mixed waste found in dry waste bins.',
      photos: ['photo1.jpg', 'photo2.jpg'],
      reportDate: new Date('2024-12-20'),
      assignedTo: 'Municipal Inspector #45',
      followUpRequired: true,
      impactScore: 6
    },
    {
      id: 'RPT002',
      reporterId: 'GC003',
      reporterName: 'Maria Rodriguez',
      type: 'inspection',
      category: 'disposal',
      severity: 'high',
      status: 'escalated',
      location: {
        lat: 40.7589,
        lng: -73.9851,
        address: '456 Park Avenue, Ward 15',
        ward: 'Ward 15',
        zone: 'South Zone'
      },
      description: 'Illegal dumping of construction waste in public area. Immediate cleanup required.',
      photos: ['photo3.jpg', 'photo4.jpg', 'photo5.jpg'],
      reportDate: new Date('2024-12-19'),
      assignedTo: 'Environmental Officer',
      escalatedTo: 'Municipal Enforcement Team',
      followUpRequired: true,
      impactScore: 9
    }
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 'ACT001',
      championId: 'GC001',
      type: 'awareness_campaign',
      title: 'Waste Sorting Workshop',
      description: 'Community workshop on proper waste sorting techniques',
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: 'Community Center, Ward 12'
      },
      scheduledDate: new Date('2024-12-22'),
      completedDate: new Date('2024-12-22'),
      status: 'completed',
      participants: 35,
      impact: {
        householdsReached: 35,
        violationsFound: 0,
        issuesResolved: 0,
        wasteCollected: 0
      },
      photos: ['workshop1.jpg', 'workshop2.jpg'],
      notes: 'Great participation from community members. Many questions about composting.',
      feedback: {
        rating: 4.8,
        comments: ['Very informative', 'Learned a lot about recycling', 'Would like more sessions']
      }
    },
    {
      id: 'ACT002',
      championId: 'GC002',
      type: 'inspection',
      title: 'Monthly Compliance Check',
      description: 'Routine inspection of waste management practices in assigned area',
      location: {
        lat: 40.7282,
        lng: -74.0776,
        address: 'Residential Block A, Ward 12'
      },
      scheduledDate: new Date('2024-12-21'),
      status: 'scheduled',
      participants: 1,
      impact: {
        householdsReached: 0,
        violationsFound: 0,
        issuesResolved: 0,
        wasteCollected: 0
      },
      photos: [],
      notes: '',
      feedback: {
        rating: 0,
        comments: []
      }
    }
  ]);

  const [metrics] = useState<PerformanceMetrics>({
    totalChampions: 3,
    activeChampions: 3,
    totalCommittees: 2,
    activeCommittees: 2,
    monthlyReports: 15,
    resolvedIssues: 12,
    complianceRate: 89,
    communityEngagement: 78,
    environmentalImpact: {
      wasteReduced: 2400, // kg
      recyclingIncrease: 35, // %
      violationsDecreased: 42 // %
    },
    regionalBreakdown: {
      'North Zone': {
        champions: 2,
        committees: 1,
        complianceRate: 87,
        activities: 8
      },
      'South Zone': {
        champions: 1,
        committees: 1,
        complianceRate: 92,
        activities: 7
      }
    }
  });

  const createChampion = (champion: Omit<GreenChampion, 'id'>) => {
    const newChampion: GreenChampion = {
      ...champion,
      id: `GC${Date.now()}`
    };
    setChampions(prev => [...prev, newChampion]);
  };

  const updateChampion = (championId: string, updates: Partial<GreenChampion>) => {
    setChampions(prev => prev.map(champion => 
      champion.id === championId ? { ...champion, ...updates } : champion
    ));
  };

  const createCommittee = (committee: Omit<WasteCommittee, 'id'>) => {
    const newCommittee: WasteCommittee = {
      ...committee,
      id: `COM${Date.now()}`
    };
    setCommittees(prev => [...prev, newCommittee]);
  };

  const updateCommittee = (committeeId: string, updates: Partial<WasteCommittee>) => {
    setCommittees(prev => prev.map(committee => 
      committee.id === committeeId ? { ...committee, ...updates } : committee
    ));
  };

  const submitReport = (report: Omit<ComplianceReport, 'id'>) => {
    const newReport: ComplianceReport = {
      ...report,
      id: `RPT${Date.now()}`
    };
    setReports(prev => [...prev, newReport]);
  };

  const updateReport = (reportId: string, updates: Partial<ComplianceReport>) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, ...updates } : report
    ));
  };

  const createActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `ACT${Date.now()}`
    };
    setActivities(prev => [...prev, newActivity]);
  };

  const updateActivity = (activityId: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId ? { ...activity, ...updates } : activity
    ));
  };

  const getChampionsByZone = (zone: string): GreenChampion[] => {
    return champions.filter(champion => champion.zone === zone);
  };

  const getCommitteesByZone = (zone: string): WasteCommittee[] => {
    return committees.filter(committee => committee.zone === zone);
  };

  const getReportsByStatus = (status: ComplianceReport['status']): ComplianceReport[] => {
    return reports.filter(report => report.status === status);
  };

  const escalateReport = (reportId: string, escalationLevel: string) => {
    updateReport(reportId, {
      status: 'escalated',
      escalatedTo: escalationLevel
    });
  };

  return (
    <GreenChampionsContext.Provider value={{
      champions,
      committees,
      reports,
      activities,
      metrics,
      createChampion,
      updateChampion,
      createCommittee,
      updateCommittee,
      submitReport,
      updateReport,
      createActivity,
      updateActivity,
      getChampionsByZone,
      getCommitteesByZone,
      getReportsByStatus,
      escalateReport
    }}>
      {children}
    </GreenChampionsContext.Provider>
  );
};

export const useGreenChampions = () => {
  const context = useContext(GreenChampionsContext);
  if (!context) {
    throw new Error('useGreenChampions must be used within a GreenChampionsProvider');
  }
  return context;
};