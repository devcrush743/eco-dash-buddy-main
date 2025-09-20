import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for facility management
export interface ProcessingFacility {
  id: string;
  name: string;
  type: 'biomethanization' | 'mrf' | 'composting' | 'wte' | 'recycling' | 'transfer_station';
  location: {
    lat: number;
    lng: number;
    address: string;
    zone: string;
  };
  status: 'operational' | 'maintenance' | 'offline' | 'emergency';
  capacity: {
    total: number; // tons per day
    current: number; // current load
    available: number; // available capacity
  };
  operationalHours: {
    open: string;
    close: string;
    days: string[];
  };
  contact: {
    manager: string;
    phone: string;
    email: string;
  };
  certifications: string[];
  lastInspection: Date;
  nextMaintenance: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecyclingCenter extends ProcessingFacility {
  materialTypes: string[];
  currentInventory: {
    [material: string]: {
      quantity: number;
      unit: string;
      lastUpdated: Date;
    };
  };
  processingRates: {
    [material: string]: number; // tons per hour
  };
  pickupAvailable: boolean;
  dropoffAvailable: boolean;
}

export interface ScrapShop {
  id: string;
  name: string;
  owner: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  specializations: string[];
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  pricing: {
    [material: string]: {
      rate: number;
      unit: string;
      lastUpdated: Date;
    };
  };
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  totalPickups: number;
  createdAt: Date;
}

export interface PickupBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  scrapShopId: string;
  scheduledDate: Date;
  timeSlot: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  items: {
    category: string;
    description: string;
    estimatedWeight: number;
    estimatedValue: number;
  }[];
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  totalEstimatedValue: number;
  actualValue?: number;
  pickupPersonnel?: string;
  notes?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WTEFacility extends ProcessingFacility {
  energyOutput: {
    current: number; // MW
    daily: number; // MWh
    monthly: number; // MWh
    efficiency: number; // %
  };
  emissions: {
    co2: number; // tons per day
    nox: number; // mg/m³
    so2: number; // mg/m³
    particulates: number; // mg/m³
    lastMeasured: Date;
  };
  inputMaterial: {
    totalProcessed: number; // tons per day
    calorificValue: number; // MJ/kg
    moistureContent: number; // %
  };
  operationalMetrics: {
    uptime: number; // %
    downtime: number; // hours
    maintenanceHours: number;
    emergencyStops: number;
  };
  complianceStatus: {
    environmental: 'compliant' | 'warning' | 'violation';
    safety: 'compliant' | 'warning' | 'violation';
    lastAudit: Date;
    nextAudit: Date;
  };
}

export interface FacilityAlert {
  id: string;
  facilityId: string;
  facilityName: string;
  type: 'capacity' | 'maintenance' | 'compliance' | 'emergency' | 'efficiency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  assignedTo?: string;
}

interface FacilityContextType {
  facilities: ProcessingFacility[];
  recyclingCenters: RecyclingCenter[];
  scrapShops: ScrapShop[];
  pickupBookings: PickupBooking[];
  wteFacilities: WTEFacility[];
  alerts: FacilityAlert[];
  
  // Facility operations
  createFacility: (facility: Omit<ProcessingFacility, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFacility: (facilityId: string, updates: Partial<ProcessingFacility>) => void;
  deleteFacility: (facilityId: string) => void;
  
  // Recycling center operations
  updateInventory: (centerId: string, material: string, quantity: number) => void;
  
  // Scrap shop operations
  createPickupBooking: (booking: Omit<PickupBooking, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBookingStatus: (bookingId: string, status: PickupBooking['status']) => void;
  
  // WTE operations
  updateWTEMetrics: (facilityId: string, metrics: Partial<WTEFacility>) => void;
  
  // Alert management
  createAlert: (alert: Omit<FacilityAlert, 'id' | 'timestamp'>) => void;
  acknowledgeAlert: (alertId: string, assignedTo: string) => void;
  resolveAlert: (alertId: string) => void;
  
  // Search and filter
  searchFacilities: (query: string, type?: string) => ProcessingFacility[];
  getFacilitiesByZone: (zone: string) => ProcessingFacility[];
  getAvailableCapacity: () => { total: number; used: number; available: number };
  
  // Analytics
  getFacilityUtilization: () => { [facilityId: string]: number };
  getProcessingVolumes: (timeframe: 'daily' | 'weekly' | 'monthly') => any;
}

const FacilityContext = createContext<FacilityContextType | undefined>(undefined);

export const FacilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Mock data - in production, this would come from APIs
  const [facilities, setFacilities] = useState<ProcessingFacility[]>([
    {
      id: 'FAC001',
      name: 'Central Biomethanization Plant',
      type: 'biomethanization',
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: '123 Industrial Ave, New York, NY',
        zone: 'North Zone'
      },
      status: 'operational',
      capacity: {
        total: 500,
        current: 320,
        available: 180
      },
      operationalHours: {
        open: '06:00',
        close: '22:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      contact: {
        manager: 'John Smith',
        phone: '+1-555-0101',
        email: 'john.smith@facility.gov'
      },
      certifications: ['ISO 14001', 'OHSAS 18001'],
      lastInspection: new Date('2024-11-15'),
      nextMaintenance: new Date('2025-01-15'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'FAC002',
      name: 'East Side MRF',
      type: 'mrf',
      location: {
        lat: 40.7589,
        lng: -73.9851,
        address: '456 Recycling Blvd, New York, NY',
        zone: 'East Zone'
      },
      status: 'operational',
      capacity: {
        total: 300,
        current: 180,
        available: 120
      },
      operationalHours: {
        open: '07:00',
        close: '19:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      contact: {
        manager: 'Sarah Johnson',
        phone: '+1-555-0102',
        email: 'sarah.johnson@facility.gov'
      },
      certifications: ['ISO 9001', 'ISO 14001'],
      lastInspection: new Date('2024-12-01'),
      nextMaintenance: new Date('2025-02-01'),
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date()
    }
  ]);

  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([
    {
      id: 'REC001',
      name: 'Metro Recycling Center',
      type: 'recycling',
      location: {
        lat: 40.7505,
        lng: -73.9934,
        address: '789 Green St, New York, NY',
        zone: 'Central Zone'
      },
      status: 'operational',
      capacity: {
        total: 200,
        current: 120,
        available: 80
      },
      operationalHours: {
        open: '08:00',
        close: '18:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      contact: {
        manager: 'Mike Chen',
        phone: '+1-555-0103',
        email: 'mike.chen@recycling.com'
      },
      certifications: ['ISO 14001'],
      lastInspection: new Date('2024-11-20'),
      nextMaintenance: new Date('2025-01-20'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date(),
      materialTypes: ['plastic', 'paper', 'glass', 'metal', 'electronics'],
      currentInventory: {
        plastic: { quantity: 15.5, unit: 'tons', lastUpdated: new Date() },
        paper: { quantity: 22.3, unit: 'tons', lastUpdated: new Date() },
        glass: { quantity: 8.7, unit: 'tons', lastUpdated: new Date() },
        metal: { quantity: 12.1, unit: 'tons', lastUpdated: new Date() },
        electronics: { quantity: 3.2, unit: 'tons', lastUpdated: new Date() }
      },
      processingRates: {
        plastic: 2.5,
        paper: 3.0,
        glass: 1.8,
        metal: 2.0,
        electronics: 0.5
      },
      pickupAvailable: true,
      dropoffAvailable: true
    }
  ]);

  const [scrapShops, setScrapShops] = useState<ScrapShop[]>([
    {
      id: 'SCRAP001',
      name: 'City Scrap & Metal',
      owner: 'Robert Wilson',
      location: {
        lat: 40.7282,
        lng: -74.0776,
        address: '321 Scrap Yard Rd, New York, NY'
      },
      contact: {
        phone: '+1-555-0201',
        email: 'robert@cityscrap.com'
      },
      specializations: ['metal', 'electronics', 'appliances', 'automotive'],
      operatingHours: {
        open: '09:00',
        close: '17:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      pricing: {
        copper: { rate: 8.50, unit: 'per kg', lastUpdated: new Date() },
        aluminum: { rate: 1.80, unit: 'per kg', lastUpdated: new Date() },
        steel: { rate: 0.25, unit: 'per kg', lastUpdated: new Date() },
        electronics: { rate: 2.00, unit: 'per kg', lastUpdated: new Date() }
      },
      status: 'active',
      rating: 4.7,
      totalPickups: 156,
      createdAt: new Date('2024-01-15')
    }
  ]);

  const [pickupBookings, setPickupBookings] = useState<PickupBooking[]>([
    {
      id: 'BOOK001',
      customerId: 'CUST001',
      customerName: 'Alice Brown',
      customerContact: '+1-555-0301',
      scrapShopId: 'SCRAP001',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      timeSlot: '10:00-12:00',
      location: {
        lat: 40.7614,
        lng: -73.9776,
        address: '555 Residential St, New York, NY'
      },
      items: [
        {
          category: 'electronics',
          description: 'Old laptop and monitor',
          estimatedWeight: 5,
          estimatedValue: 10.00
        },
        {
          category: 'metal',
          description: 'Copper pipes',
          estimatedWeight: 8,
          estimatedValue: 68.00
        }
      ],
      status: 'confirmed',
      totalEstimatedValue: 78.00,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [wteFacilities, setWteFacilities] = useState<WTEFacility[]>([
    {
      id: 'WTE001',
      name: 'Metro Waste-to-Energy Plant',
      type: 'wte',
      location: {
        lat: 40.6892,
        lng: -74.0445,
        address: '100 Energy Plant Rd, New York, NY',
        zone: 'South Zone'
      },
      status: 'operational',
      capacity: {
        total: 1000,
        current: 750,
        available: 250
      },
      operationalHours: {
        open: '00:00',
        close: '23:59',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      contact: {
        manager: 'David Lee',
        phone: '+1-555-0401',
        email: 'david.lee@wte.gov'
      },
      certifications: ['ISO 14001', 'EPA Compliance'],
      lastInspection: new Date('2024-12-01'),
      nextMaintenance: new Date('2025-03-01'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date(),
      energyOutput: {
        current: 45.5,
        daily: 1092,
        monthly: 32760,
        efficiency: 85.2
      },
      emissions: {
        co2: 850,
        nox: 180,
        so2: 45,
        particulates: 12,
        lastMeasured: new Date()
      },
      inputMaterial: {
        totalProcessed: 750,
        calorificValue: 10.5,
        moistureContent: 35
      },
      operationalMetrics: {
        uptime: 94.5,
        downtime: 4.2,
        maintenanceHours: 8,
        emergencyStops: 0
      },
      complianceStatus: {
        environmental: 'compliant',
        safety: 'compliant',
        lastAudit: new Date('2024-10-15'),
        nextAudit: new Date('2025-04-15')
      }
    }
  ]);

  const [alerts, setAlerts] = useState<FacilityAlert[]>([
    {
      id: 'ALERT001',
      facilityId: 'FAC001',
      facilityName: 'Central Biomethanization Plant',
      type: 'capacity',
      severity: 'medium',
      message: 'Facility approaching 70% capacity. Consider scheduling additional pickups.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      acknowledged: false
    },
    {
      id: 'ALERT002',
      facilityId: 'WTE001',
      facilityName: 'Metro Waste-to-Energy Plant',
      type: 'efficiency',
      severity: 'low',
      message: 'Energy efficiency dropped to 85.2%. Monitoring required.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      acknowledged: true,
      assignedTo: 'David Lee'
    }
  ]);

  // Facility operations
  const createFacility = (facility: Omit<ProcessingFacility, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFacility: ProcessingFacility = {
      ...facility,
      id: `FAC${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setFacilities(prev => [...prev, newFacility]);
  };

  const updateFacility = (facilityId: string, updates: Partial<ProcessingFacility>) => {
    setFacilities(prev => prev.map(facility => 
      facility.id === facilityId 
        ? { ...facility, ...updates, updatedAt: new Date() }
        : facility
    ));
  };

  const deleteFacility = (facilityId: string) => {
    setFacilities(prev => prev.filter(facility => facility.id !== facilityId));
  };

  // Recycling center operations
  const updateInventory = (centerId: string, material: string, quantity: number) => {
    setRecyclingCenters(prev => prev.map(center => 
      center.id === centerId 
        ? {
            ...center,
            currentInventory: {
              ...center.currentInventory,
              [material]: {
                quantity,
                unit: center.currentInventory[material]?.unit || 'tons',
                lastUpdated: new Date()
              }
            },
            updatedAt: new Date()
          }
        : center
    ));
  };

  // Scrap shop operations
  const createPickupBooking = (booking: Omit<PickupBooking, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBooking: PickupBooking = {
      ...booking,
      id: `BOOK${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPickupBookings(prev => [...prev, newBooking]);
  };

  const updateBookingStatus = (bookingId: string, status: PickupBooking['status']) => {
    setPickupBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status, updatedAt: new Date() }
        : booking
    ));
  };

  // WTE operations
  const updateWTEMetrics = (facilityId: string, metrics: Partial<WTEFacility>) => {
    setWteFacilities(prev => prev.map(facility => 
      facility.id === facilityId 
        ? { ...facility, ...metrics, updatedAt: new Date() }
        : facility
    ));
  };

  // Alert management
  const createAlert = (alert: Omit<FacilityAlert, 'id' | 'timestamp'>) => {
    const newAlert: FacilityAlert = {
      ...alert,
      id: `ALERT${Date.now()}`,
      timestamp: new Date()
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const acknowledgeAlert = (alertId: string, assignedTo: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, assignedTo }
        : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolvedAt: new Date() }
        : alert
    ));
  };

  // Search and filter
  const searchFacilities = (query: string, type?: string): ProcessingFacility[] => {
    return facilities.filter(facility => {
      const matchesQuery = facility.name.toLowerCase().includes(query.toLowerCase()) ||
                          facility.location.address.toLowerCase().includes(query.toLowerCase());
      const matchesType = !type || facility.type === type;
      return matchesQuery && matchesType;
    });
  };

  const getFacilitiesByZone = (zone: string): ProcessingFacility[] => {
    return facilities.filter(facility => facility.location.zone === zone);
  };

  const getAvailableCapacity = () => {
    const total = facilities.reduce((sum, facility) => sum + facility.capacity.total, 0);
    const used = facilities.reduce((sum, facility) => sum + facility.capacity.current, 0);
    const available = facilities.reduce((sum, facility) => sum + facility.capacity.available, 0);
    return { total, used, available };
  };

  // Analytics
  const getFacilityUtilization = (): { [facilityId: string]: number } => {
    const utilization: { [facilityId: string]: number } = {};
    facilities.forEach(facility => {
      utilization[facility.id] = (facility.capacity.current / facility.capacity.total) * 100;
    });
    return utilization;
  };

  const getProcessingVolumes = (timeframe: 'daily' | 'weekly' | 'monthly') => {
    // Mock implementation - in production, this would aggregate real data
    return {
      biomethanization: timeframe === 'daily' ? 320 : timeframe === 'weekly' ? 2240 : 9600,
      mrf: timeframe === 'daily' ? 180 : timeframe === 'weekly' ? 1260 : 5400,
      recycling: timeframe === 'daily' ? 120 : timeframe === 'weekly' ? 840 : 3600,
      wte: timeframe === 'daily' ? 750 : timeframe === 'weekly' ? 5250 : 22500
    };
  };

  return (
    <FacilityContext.Provider value={{
      facilities,
      recyclingCenters,
      scrapShops,
      pickupBookings,
      wteFacilities,
      alerts,
      createFacility,
      updateFacility,
      deleteFacility,
      updateInventory,
      createPickupBooking,
      updateBookingStatus,
      updateWTEMetrics,
      createAlert,
      acknowledgeAlert,
      resolveAlert,
      searchFacilities,
      getFacilitiesByZone,
      getAvailableCapacity,
      getFacilityUtilization,
      getProcessingVolumes
    }}>
      {children}
    </FacilityContext.Provider>
  );
};

export const useFacility = () => {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
};