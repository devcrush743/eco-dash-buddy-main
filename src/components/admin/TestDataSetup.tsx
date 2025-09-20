import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Database, Users, MapPin, Loader2, CheckCircle } from 'lucide-react';

export const TestDataSetup = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [createdCounts, setCreatedCounts] = useState({ reports: 0, drivers: 0 });
  const { toast } = useToast();

  const testReports = [
    {
      description: "Large garbage pile near school entrance - urgent cleanup needed",
      coords: { lat: 28.6139, lng: 77.2090 },
      status: "open",
      priority: "red",
      reporterId: "test_citizen_1"
    },
    {
      description: "Plastic bottles scattered in Central Park",
      coords: { lat: 28.6140, lng: 77.2095 },
      status: "open",
      priority: "yellow", 
      reporterId: "test_citizen_2"
    },
    {
      description: "Food waste and organic matter in residential area",
      coords: { lat: 28.6145, lng: 77.2100 },
      status: "open",
      priority: "green",
      reporterId: "test_citizen_3"
    },
    {
      description: "Construction debris blocking main road - traffic hazard",
      coords: { lat: 28.6150, lng: 77.2105 },
      status: "open",
      priority: "red",
      reporterId: "test_citizen_4"
    },
    {
      description: "Electronic waste collection point",
      coords: { lat: 28.6155, lng: 77.2110 },
      status: "open",
      priority: "yellow",
      reporterId: "test_citizen_5"
    },
    {
      description: "Mixed waste near shopping mall",
      coords: { lat: 28.6160, lng: 77.2115 },
      status: "open",
      priority: "green",
      reporterId: "test_citizen_6"
    }
  ];

  const testDrivers = [
    {
      driverId: "DRIVER001",
      name: "John Smith",
      active: true,
      baseLocation: { lat: 28.6100, lng: 77.2050 },
      maxCapacity: 100,
      onDuty: false,
      email: "john.smith@ecodash.com"
    },
    {
      driverId: "DRIVER002",
      name: "Sarah Johnson", 
      active: true,
      baseLocation: { lat: 28.6200, lng: 77.2150 },
      maxCapacity: 80,
      onDuty: false,
      email: "sarah.johnson@ecodash.com"
    },
    {
      driverId: "DRIVER003",
      name: "Mike Wilson",
      active: true,
      baseLocation: { lat: 28.6000, lng: 77.2000 },
      maxCapacity: 120,
      onDuty: false,
      email: "mike.wilson@ecodash.com"
    }
  ];

  const createTestReports = async () => {
    let created = 0;
    for (const report of testReports) {
      try {
        await addDoc(collection(db, 'reports'), {
          ...report,
          reportedAt: serverTimestamp()
        });
        created++;
      } catch (error) {
        console.error('Error creating report:', error);
      }
    }
    return created;
  };

  const createTestDrivers = async () => {
    let created = 0;
    for (const driver of testDrivers) {
      try {
        await addDoc(collection(db, 'drivers'), driver);
        created++;
      } catch (error) {
        console.error('Error creating driver:', error);
      }
    }
    return created;
  };

  const handleCreateTestData = async () => {
    setIsCreating(true);
    setCreatedCounts({ reports: 0, drivers: 0 });

    try {
      // Create reports
      const reportsCreated = await createTestReports();
      setCreatedCounts(prev => ({ ...prev, reports: reportsCreated }));

      // Create drivers
      const driversCreated = await createTestDrivers();
      setCreatedCounts(prev => ({ ...prev, drivers: driversCreated }));

      toast({
        title: "Test Data Created Successfully!",
        description: `Created ${reportsCreated} reports and ${driversCreated} drivers. You can now test route optimization.`,
      });

    } catch (error) {
      console.error('Error creating test data:', error);
      toast({
        title: "Error Creating Test Data",
        description: "Failed to create test data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Route Optimization Test Data Setup
        </CardTitle>
        <CardDescription>
          Create sample reports and drivers to test the Smart Route Optimization system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <MapPin className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Test Reports</p>
              <p className="text-sm text-green-700">
                {createdCounts.reports > 0 ? `${createdCounts.reports} created` : '6 sample reports'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Test Drivers</p>
              <p className="text-sm text-blue-700">
                {createdCounts.drivers > 0 ? `${createdCounts.drivers} created` : '3 sample drivers'}
              </p>
            </div>
          </div>
        </div>

        {/* Sample Data Preview */}
        <div className="space-y-4">
          <h4 className="font-medium">Sample Data Preview:</h4>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Reports (Status: "open"):</p>
            <div className="flex flex-wrap gap-2">
              {testReports.map((report, index) => (
                <Badge key={index} variant={report.priority === 'red' ? 'destructive' : report.priority === 'yellow' ? 'default' : 'secondary'}>
                  {report.priority} - {report.description.substring(0, 30)}...
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Drivers (Active: true):</p>
            <div className="flex flex-wrap gap-2">
              {testDrivers.map((driver, index) => (
                <Badge key={index} variant="outline">
                  {driver.name} - {driver.driverId}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Create Button */}
        <Button 
          onClick={handleCreateTestData}
          disabled={isCreating}
          className="w-full gap-2 bg-gradient-hero shadow-premium hover:shadow-glow"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Test Data...
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              Create Test Data for Route Optimization
            </>
          )}
        </Button>

        {createdCounts.reports > 0 && createdCounts.drivers > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">
              ✅ Test data created! You can now test the Smart Route Optimization system.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestDataSetup;
