import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Bin {
  id: string;
  qrCode: string;
  type: 'dry' | 'wet' | 'hazardous';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  fillLevel: number;
  lastEmptied: Date;
  status: 'active' | 'maintenance' | 'full' | 'damaged';
  sensorId: string;
  capacity: number;
  lastUpdated: Date;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'compactor' | 'tipper' | 'hazmat';
  currentLocation: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'maintenance' | 'idle' | 'collecting';
  driver: string;
  route?: string;
  capacity: number;
  currentLoad: number;
  lastUpdated: Date;
}

export interface PickupSchedule {
  id: string;
  binIds: string[];
  vehicleId: string;
  scheduledTime: Date;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  route: {
    lat: number;
    lng: number;
  }[];
  actualStartTime?: Date;
  actualEndTime?: Date;
}

export interface BulkWasteRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  wasteType: string;
  estimatedVolume: number;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'scheduled' | 'collected' | 'rejected';
  requestDate: Date;
  scheduledDate?: Date;
  assignedVehicle?: string;
  specialRequirements?: string[];
  photos?: string[];
}

interface WasteCollectionContextType {
  bins: Bin[];
  vehicles: Vehicle[];
  schedules: PickupSchedule[];
  bulkRequests: BulkWasteRequest[];
  updateBin: (binId: string, updates: Partial<Bin>) => void;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => void;
  createSchedule: (schedule: Omit<PickupSchedule, 'id'>) => void;
  updateSchedule: (scheduleId: string, updates: Partial<PickupSchedule>) => void;
  createBulkRequest: (request: Omit<BulkWasteRequest, 'id'>) => void;
  updateBulkRequest: (requestId: string, updates: Partial<BulkWasteRequest>) => void;
  getOptimizedRoute: (binIds: string[]) => Promise<{lat: number; lng: number}[]>;
  getBinsByFillLevel: (threshold: number) => Bin[];
  getVehiclesByStatus: (status: Vehicle['status']) => Vehicle[];
}

const WasteCollectionContext = createContext<WasteCollectionContextType | undefined>(undefined);

export const WasteCollectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Mock data - in production, this would come from APIs
  const [bins, setBins] = useState<Bin[]>([
    {
      id: 'BIN001',
      qrCode: 'QR_BIN001_DRY',
      type: 'dry',
      location: { lat: 40.7128, lng: -74.0060, address: '123 Main St, New York, NY' },
      fillLevel: 85,
      lastEmptied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'full',
      sensorId: 'SENSOR_001',
      capacity: 100,
      lastUpdated: new Date()
    },
    {
      id: 'BIN002',
      qrCode: 'QR_BIN002_WET',
      type: 'wet',
      location: { lat: 40.7589, lng: -73.9851, address: '456 Park Ave, New York, NY' },
      fillLevel: 45,
      lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'active',
      sensorId: 'SENSOR_002',
      capacity: 100,
      lastUpdated: new Date()
    },
    {
      id: 'BIN003',
      qrCode: 'QR_BIN003_HAZ',
      type: 'hazardous',
      location: { lat: 40.7505, lng: -73.9934, address: '789 Broadway, New York, NY' },
      fillLevel: 25,
      lastEmptied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'active',
      sensorId: 'SENSOR_003',
      capacity: 50,
      lastUpdated: new Date()
    }
  ]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'VEH001',
      plateNumber: 'WM-001',
      type: 'compactor',
      currentLocation: { lat: 40.7282, lng: -74.0776 },
      status: 'active',
      driver: 'John Smith',
      route: 'Route A',
      capacity: 1000,
      currentLoad: 650,
      lastUpdated: new Date()
    },
    {
      id: 'VEH002',
      plateNumber: 'WM-002',
      type: 'tipper',
      currentLocation: { lat: 40.7614, lng: -73.9776 },
      status: 'collecting',
      driver: 'Maria Garcia',
      route: 'Route B',
      capacity: 800,
      currentLoad: 320,
      lastUpdated: new Date()
    }
  ]);

  const [schedules, setSchedules] = useState<PickupSchedule[]>([
    {
      id: 'SCH001',
      binIds: ['BIN001', 'BIN002'],
      vehicleId: 'VEH001',
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      estimatedDuration: 45,
      priority: 'high',
      status: 'scheduled',
      route: [
        { lat: 40.7128, lng: -74.0060 },
        { lat: 40.7589, lng: -73.9851 }
      ]
    }
  ]);

  const [bulkRequests, setBulkRequests] = useState<BulkWasteRequest[]>([
    {
      id: 'BULK001',
      requesterId: 'USER001',
      requesterName: 'ABC Construction Co.',
      location: { lat: 40.7505, lng: -73.9934, address: '100 Construction Site, NY' },
      wasteType: 'Construction Debris',
      estimatedVolume: 15,
      description: 'Mixed construction waste including concrete, wood, and metal',
      priority: 'medium',
      status: 'pending',
      requestDate: new Date(),
      specialRequirements: ['Heavy machinery access', 'Weekend pickup preferred']
    }
  ]);

  const updateBin = (binId: string, updates: Partial<Bin>) => {
    setBins(prev => prev.map(bin => 
      bin.id === binId ? { ...bin, ...updates, lastUpdated: new Date() } : bin
    ));
  };

  const updateVehicle = (vehicleId: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId ? { ...vehicle, ...updates, lastUpdated: new Date() } : vehicle
    ));
  };

  const createSchedule = (schedule: Omit<PickupSchedule, 'id'>) => {
    const newSchedule: PickupSchedule = {
      ...schedule,
      id: `SCH${Date.now()}`
    };
    setSchedules(prev => [...prev, newSchedule]);
  };

  const updateSchedule = (scheduleId: string, updates: Partial<PickupSchedule>) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
    ));
  };

  const createBulkRequest = (request: Omit<BulkWasteRequest, 'id'>) => {
    const newRequest: BulkWasteRequest = {
      ...request,
      id: `BULK${Date.now()}`
    };
    setBulkRequests(prev => [...prev, newRequest]);
  };

  const updateBulkRequest = (requestId: string, updates: Partial<BulkWasteRequest>) => {
    setBulkRequests(prev => prev.map(request => 
      request.id === requestId ? { ...request, ...updates } : request
    ));
  };

  const getOptimizedRoute = async (binIds: string[]): Promise<{lat: number; lng: number}[]> => {
    // Mock route optimization - in production, use routing APIs
    const selectedBins = bins.filter(bin => binIds.includes(bin.id));
    return selectedBins.map(bin => ({ lat: bin.location.lat, lng: bin.location.lng }));
  };

  const getBinsByFillLevel = (threshold: number): Bin[] => {
    return bins.filter(bin => bin.fillLevel >= threshold);
  };

  const getVehiclesByStatus = (status: Vehicle['status']): Vehicle[] => {
    return vehicles.filter(vehicle => vehicle.status === status);
  };

  return (
    <WasteCollectionContext.Provider value={{
      bins,
      vehicles,
      schedules,
      bulkRequests,
      updateBin,
      updateVehicle,
      createSchedule,
      updateSchedule,
      createBulkRequest,
      updateBulkRequest,
      getOptimizedRoute,
      getBinsByFillLevel,
      getVehiclesByStatus
    }}>
      {children}
    </WasteCollectionContext.Provider>
  );
};

export const useWasteCollection = () => {
  const context = useContext(WasteCollectionContext);
  if (!context) {
    throw new Error('useWasteCollection must be used within a WasteCollectionProvider');
  }
  return context;
};