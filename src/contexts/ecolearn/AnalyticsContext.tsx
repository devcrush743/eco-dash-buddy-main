import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for analytics data
export interface WasteMetrics {
  totalCollected: number;
  recyclingRate: number;
  organicWaste: number;
  plasticWaste: number;
  paperWaste: number;
  glassWaste: number;
  metalWaste: number;
  hazardousWaste: number;
}

export interface PerformanceMetrics {
  collectionEfficiency: number;
  routeOptimization: number;
  fuelConsumption: number;
  vehicleUtilization: number;
  maintenanceCosts: number;
}

export interface ComplianceMetrics {
  regulatoryCompliance: number;
  safetyIncidents: number;
  environmentalImpact: number;
  certificationStatus: string;
}

export interface EnvironmentalMetrics {
  co2Reduction: number;
  energySavings: number;
  waterSaved: number;
  landfillDiversion: number;
  wasteToEnergyConversion: number;
  recyclingRate: number;
}

export interface CostBenefitAnalysis {
  totalOperationalCost: number;
  costPerTonProcessed: number;
  revenueFromRecyclables: number;
  energyRevenue: number;
  carbonCreditValue: number;
  roi: number;
  paybackPeriod: number;
  netBenefit: number;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'bin_fill_prediction' | 'route_optimization' | 'demand_forecasting';
  accuracy: number;
  lastTrained: Date;
  predictions: {
    [key: string]: {
      value: number;
      confidence: number;
      timestamp: Date;
    };
  };
}

export interface ComplianceReport {
  id: string;
  type: 'monthly' | 'quarterly' | 'annual';
  generatedDate: Date;
  metrics: {
    collectionEfficiency: number;
    binUtilization: number;
    routeOptimization: number;
    citizenCompliance: number;
  };
  alerts: Array<{
    level: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    message: string;
  }>;
  recommendations: string[];
}

export interface AnalyticsData {
  wasteMetrics: WasteMetrics;
  performanceMetrics: PerformanceMetrics;
  complianceMetrics: ComplianceMetrics;
  environmentalMetrics: EnvironmentalMetrics;
  costBenefitAnalysis: CostBenefitAnalysis;
  predictiveModels: PredictiveModel[];
  complianceReports: ComplianceReport[];
  trends: {
    wasteGeneration: number[];
    recyclingRates: number[];
    collectionEfficiency: number[];
  };
}

interface AnalyticsContextType {
  analyticsData: AnalyticsData;
  environmentalMetrics: EnvironmentalMetrics;
  costBenefitAnalysis: CostBenefitAnalysis;
  predictiveModels: PredictiveModel[];
  complianceReports: ComplianceReport[];
  updateAnalytics: (data: Partial<AnalyticsData>) => void;
  getMetricsByRole: (role: string) => Partial<AnalyticsData>;
  getWastePatterns: (options?: { zone?: string }) => any;
  getPredictions: (modelType: string) => any;
  getPerformanceMetrics: (options: { start: Date; end: Date }) => any;
  generateComplianceReport: (type: string, options: any) => ComplianceReport;
  exportReport: (reportId: string, format: string) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Mock data for analytics
const mockAnalyticsData: AnalyticsData = {
  wasteMetrics: {
    totalCollected: 15420,
    recyclingRate: 68.5,
    organicWaste: 4200,
    plasticWaste: 3100,
    paperWaste: 2800,
    glassWaste: 1900,
    metalWaste: 1200,
    hazardousWaste: 320
  },
  performanceMetrics: {
    collectionEfficiency: 92.3,
    routeOptimization: 87.1,
    fuelConsumption: 245.8,
    vehicleUtilization: 78.9,
    maintenanceCosts: 12500
  },
  complianceMetrics: {
    regulatoryCompliance: 95.2,
    safetyIncidents: 2,
    environmentalImpact: 8.3,
    certificationStatus: 'ISO 14001 Certified'
  },
  environmentalMetrics: {
    co2Reduction: 2400,
    energySavings: 15600,
    waterSaved: 8900,
    landfillDiversion: 12300,
    wasteToEnergyConversion: 4500,
    recyclingRate: 68.5
  },
  costBenefitAnalysis: {
    totalOperationalCost: 245000,
    costPerTonProcessed: 85,
    revenueFromRecyclables: 45000,
    energyRevenue: 23000,
    carbonCreditValue: 12000,
    roi: 15.8,
    paybackPeriod: 18,
    netBenefit: 80000
  },
  predictiveModels: [
    {
      id: 'model-001',
      name: 'Bin Fill Prediction',
      type: 'bin_fill_prediction',
      accuracy: 94.2,
      lastTrained: new Date('2024-12-01'),
      predictions: {
        'next_week_fill_rate': { value: 78.5, confidence: 0.92, timestamp: new Date() },
        'overflow_risk': { value: 12.3, confidence: 0.88, timestamp: new Date() },
        'optimal_pickup_time': { value: 48, confidence: 0.95, timestamp: new Date() }
      }
    },
    {
      id: 'model-002',
      name: 'Route Optimization',
      type: 'route_optimization',
      accuracy: 89.7,
      lastTrained: new Date('2024-11-28'),
      predictions: {
        'fuel_savings': { value: 15.2, confidence: 0.87, timestamp: new Date() },
        'time_reduction': { value: 23.4, confidence: 0.91, timestamp: new Date() },
        'optimal_routes': { value: 8, confidence: 0.93, timestamp: new Date() }
      }
    }
  ],
  complianceReports: [
    {
      id: 'report-001',
      type: 'monthly',
      generatedDate: new Date(),
      metrics: {
        collectionEfficiency: 92.3,
        binUtilization: 87.6,
        routeOptimization: 89.1,
        citizenCompliance: 78.4
      },
      alerts: [
        {
          level: 'medium',
          category: 'efficiency',
          message: 'Collection efficiency in Zone B below target (85%)'
        },
        {
          level: 'high',
          category: 'compliance',
          message: 'Citizen compliance rate declining in residential areas'
        }
      ],
      recommendations: [
        'Increase awareness campaigns in low-compliance areas',
        'Optimize collection routes in Zone B',
        'Deploy additional bins in high-density areas'
      ]
    }
  ],
  trends: {
    wasteGeneration: [12000, 13500, 14200, 15420, 16100, 15800],
    recyclingRates: [62.1, 64.8, 66.2, 68.5, 69.1, 68.9],
    collectionEfficiency: [88.2, 89.7, 91.1, 92.3, 91.8, 92.1]
  }
};

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);

  const updateAnalytics = (data: Partial<AnalyticsData>) => {
    setAnalyticsData(prev => ({
      ...prev,
      ...data
    }));
  };

  const getWastePatterns = (options?: { zone?: string }) => {
    // Mock implementation - in production, this would query actual data
    return {
      household: 65,
      commercial: 25,
      institutional: 10
    };
  };

  const getPredictions = (modelType: string) => {
    const model = analyticsData.predictiveModels.find(m => m.type === modelType);
    return model?.predictions || {};
  };

  const getPerformanceMetrics = (options: { start: Date; end: Date }) => {
    // Mock implementation - in production, this would filter by date range
    return analyticsData.performanceMetrics;
  };

  const generateComplianceReport = (type: string, options: any): ComplianceReport => {
    return {
      id: `report-${Date.now()}`,
      type: type as any,
      generatedDate: new Date(),
      metrics: {
        collectionEfficiency: 92.3,
        binUtilization: 87.6,
        routeOptimization: 89.1,
        citizenCompliance: 78.4
      },
      alerts: [],
      recommendations: ['Generated report recommendations']
    };
  };

  const exportReport = async (reportId: string, format: string): Promise<void> => {
    // Mock implementation - in production, this would generate and download the report
    console.log(`Exporting report ${reportId} as ${format}`);
    return Promise.resolve();
  };

  const getMetricsByRole = (role: string): Partial<AnalyticsData> => {
    switch (role) {
      case 'admin':
        return analyticsData;
      case 'manager':
        return {
          wasteMetrics: analyticsData.wasteMetrics,
          performanceMetrics: analyticsData.performanceMetrics,
          trends: analyticsData.trends
        };
      case 'operator':
        return {
          wasteMetrics: {
            totalCollected: analyticsData.wasteMetrics.totalCollected,
            recyclingRate: analyticsData.wasteMetrics.recyclingRate,
            organicWaste: analyticsData.wasteMetrics.organicWaste,
            plasticWaste: analyticsData.wasteMetrics.plasticWaste,
            paperWaste: analyticsData.wasteMetrics.paperWaste,
            glassWaste: analyticsData.wasteMetrics.glassWaste,
            metalWaste: analyticsData.wasteMetrics.metalWaste,
            hazardousWaste: analyticsData.wasteMetrics.hazardousWaste
          },
          performanceMetrics: {
            collectionEfficiency: analyticsData.performanceMetrics.collectionEfficiency,
            routeOptimization: analyticsData.performanceMetrics.routeOptimization,
            fuelConsumption: analyticsData.performanceMetrics.fuelConsumption,
            vehicleUtilization: analyticsData.performanceMetrics.vehicleUtilization,
            maintenanceCosts: analyticsData.performanceMetrics.maintenanceCosts
          }
        };
      default:
        return {
          wasteMetrics: {
            totalCollected: analyticsData.wasteMetrics.totalCollected,
            recyclingRate: analyticsData.wasteMetrics.recyclingRate,
            organicWaste: analyticsData.wasteMetrics.organicWaste,
            plasticWaste: analyticsData.wasteMetrics.plasticWaste,
            paperWaste: analyticsData.wasteMetrics.paperWaste,
            glassWaste: analyticsData.wasteMetrics.glassWaste,
            metalWaste: analyticsData.wasteMetrics.metalWaste,
            hazardousWaste: analyticsData.wasteMetrics.hazardousWaste
          }
        };
    }
  };

  return (
    <AnalyticsContext.Provider value={{
      analyticsData,
      environmentalMetrics: analyticsData.environmentalMetrics,
      costBenefitAnalysis: analyticsData.costBenefitAnalysis,
      predictiveModels: analyticsData.predictiveModels,
      complianceReports: analyticsData.complianceReports,
      updateAnalytics,
      getMetricsByRole,
      getWastePatterns,
      getPredictions,
      getPerformanceMetrics,
      generateComplianceReport,
      exportReport
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}