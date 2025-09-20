import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Database, Users, MapPin, Loader2, CheckCircle, Trash2 } from 'lucide-react';

export const DelhiTestDataSetup = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [createdCounts, setCreatedCounts] = useState({ reports: 0, drivers: 0 });
  const { toast } = useToast();

  // Comprehensive Delhi waste reports across different areas
  const delhiReports = [
    // Central Delhi - High Priority
    { description: "URGENT: Overflowing garbage bins near India Gate - tourist area", coords: { lat: 28.6129, lng: 77.2295 }, priority: "red", area: "Central Delhi" },
    { description: "Large waste pile near Connaught Place metro station", coords: { lat: 28.6315, lng: 77.2167 }, priority: "red", area: "Central Delhi" },
    { description: "Construction debris blocking road near Red Fort", coords: { lat: 28.6562, lng: 77.2410 }, priority: "red", area: "Central Delhi" },
    { description: "Food waste and plastic near Jama Masjid entrance", coords: { lat: 28.6506, lng: 77.2334 }, priority: "yellow", area: "Central Delhi" },
    { description: "Mixed waste near Chandni Chowk market", coords: { lat: 28.6510, lng: 77.2306 }, priority: "yellow", area: "Central Delhi" },
    
    // South Delhi - Mixed Priority
    { description: "URGENT: Garbage overflow near Select City Walk mall", coords: { lat: 28.5355, lng: 77.2149 }, priority: "red", area: "South Delhi" },
    { description: "Plastic bottles scattered in Hauz Khas park", coords: { lat: 28.5478, lng: 77.1944 }, priority: "yellow", area: "South Delhi" },
    { description: "Organic waste near Green Park metro station", coords: { lat: 28.5400, lng: 77.2000 }, priority: "green", area: "South Delhi" },
    { description: "Electronic waste near Saket metro station", coords: { lat: 28.5244, lng: 77.2061 }, priority: "yellow", area: "South Delhi" },
    { description: "Construction waste near Vasant Kunj", coords: { lat: 28.5230, lng: 77.1530 }, priority: "green", area: "South Delhi" },
    
    // East Delhi - High Volume
    { description: "URGENT: Large garbage dump near Laxmi Nagar metro", coords: { lat: 28.6358, lng: 77.2750 }, priority: "red", area: "East Delhi" },
    { description: "Food waste near Preet Vihar market", coords: { lat: 28.6300, lng: 77.2900 }, priority: "yellow", area: "East Delhi" },
    { description: "Plastic waste near Mayur Vihar Phase 1", coords: { lat: 28.6100, lng: 77.3000 }, priority: "green", area: "East Delhi" },
    { description: "Mixed waste near Anand Vihar ISBT", coords: { lat: 28.6500, lng: 77.3200 }, priority: "yellow", area: "East Delhi" },
    { description: "Construction debris near Shahdara", coords: { lat: 28.6700, lng: 77.2800 }, priority: "green", area: "East Delhi" },
    
    // West Delhi - Commercial Areas
    { description: "URGENT: Overflowing bins near Rajouri Garden metro", coords: { lat: 28.6500, lng: 77.1200 }, priority: "red", area: "West Delhi" },
    { description: "Food waste near Karol Bagh market", coords: { lat: 28.6500, lng: 77.1900 }, priority: "yellow", area: "West Delhi" },
    { description: "Plastic bottles near Janakpuri", coords: { lat: 28.6200, lng: 77.0800 }, priority: "green", area: "West Delhi" },
    { description: "Electronic waste near Dwarka Sector 21", coords: { lat: 28.5800, lng: 77.0500 }, priority: "yellow", area: "West Delhi" },
    { description: "Mixed waste near Punjabi Bagh", coords: { lat: 28.6600, lng: 77.1300 }, priority: "green", area: "West Delhi" },
    
    // North Delhi - Residential Areas
    { description: "URGENT: Garbage pile near Civil Lines metro", coords: { lat: 28.6800, lng: 77.2200 }, priority: "red", area: "North Delhi" },
    { description: "Food waste near Kamla Nagar market", coords: { lat: 28.6800, lng: 77.2000 }, priority: "yellow", area: "North Delhi" },
    { description: "Plastic waste near Model Town", coords: { lat: 28.7000, lng: 77.1800 }, priority: "green", area: "North Delhi" },
    { description: "Organic waste near Timarpur", coords: { lat: 28.7200, lng: 77.2000 }, priority: "green", area: "North Delhi" },
    { description: "Construction waste near Rohini Sector 8", coords: { lat: 28.7500, lng: 77.1000 }, priority: "yellow", area: "North Delhi" },
    
    // Additional scattered locations
    { description: "Mixed waste near ITO intersection", coords: { lat: 28.6300, lng: 77.2400 }, priority: "green", area: "Central Delhi" },
    { description: "Plastic bottles near Nehru Place", coords: { lat: 28.5500, lng: 77.2500 }, priority: "yellow", area: "South Delhi" },
    { description: "Food waste near Lajpat Nagar market", coords: { lat: 28.5600, lng: 77.2400 }, priority: "green", area: "South Delhi" },
    { description: "Construction debris near Okhla Phase 1", coords: { lat: 28.5400, lng: 77.2700 }, priority: "yellow", area: "South Delhi" },
    { description: "Electronic waste near Kalkaji", coords: { lat: 28.5500, lng: 77.2600 }, priority: "green", area: "South Delhi" },
    
    // More locations for better clustering
    { description: "Garbage overflow near CP metro station", coords: { lat: 28.6315, lng: 77.2167 }, priority: "red", area: "Central Delhi" },
    { description: "Waste pile near Dhaula Kuan", coords: { lat: 28.5800, lng: 77.1600 }, priority: "yellow", area: "South Delhi" },
    { description: "Mixed waste near Noida border", coords: { lat: 28.6000, lng: 77.3200 }, priority: "green", area: "East Delhi" },
    { description: "Plastic waste near Gurgaon border", coords: { lat: 28.5000, lng: 77.1000 }, priority: "yellow", area: "South Delhi" },
    { description: "Food waste near Airport area", coords: { lat: 28.5600, lng: 77.1200 }, priority: "green", area: "South Delhi" }
  ];

  // Drivers located across different areas of Delhi
  const delhiDrivers = [
    { driverId: "DEL001", name: "Rajesh Kumar", baseLocation: { lat: 28.6129, lng: 77.2295 }, area: "Central Delhi" },
    { driverId: "DEL002", name: "Priya Sharma", baseLocation: { lat: 28.5355, lng: 77.2149 }, area: "South Delhi" },
    { driverId: "DEL003", name: "Amit Singh", baseLocation: { lat: 28.6358, lng: 77.2750 }, area: "East Delhi" },
    { driverId: "DEL004", name: "Sunita Devi", baseLocation: { lat: 28.6500, lng: 77.1200 }, area: "West Delhi" },
    { driverId: "DEL005", name: "Vikram Gupta", baseLocation: { lat: 28.6800, lng: 77.2200 }, area: "North Delhi" },
    { driverId: "DEL006", name: "Meera Joshi", baseLocation: { lat: 28.5800, lng: 77.1600 }, area: "South Delhi" },
    { driverId: "DEL007", name: "Ravi Verma", baseLocation: { lat: 28.6100, lng: 77.3000 }, area: "East Delhi" },
    { driverId: "DEL008", name: "Kavita Singh", baseLocation: { lat: 28.6200, lng: 77.0800 }, area: "West Delhi" },
    { driverId: "DEL009", name: "Suresh Kumar", baseLocation: { lat: 28.7000, lng: 77.1800 }, area: "North Delhi" },
    { driverId: "DEL010", name: "Anita Yadav", baseLocation: { lat: 28.5500, lng: 77.2500 }, area: "South Delhi" }
  ];

  const createDelhiReports = async () => {
    let created = 0;
    for (const report of delhiReports) {
      try {
        await addDoc(collection(db, 'reports'), {
          description: report.description,
          coords: report.coords,
          status: "open",
          priority: report.priority,
          area: report.area,
          reportedAt: serverTimestamp(),
          reporterId: `test_citizen_${Math.random().toString(36).substr(2, 9)}`
        });
        created++;
      } catch (error) {
        console.error('Error creating report:', error);
      }
    }
    return created;
  };

  const createDelhiDrivers = async () => {
    let created = 0;
    for (const driver of delhiDrivers) {
      try {
        await addDoc(collection(db, 'drivers'), {
          driverId: driver.driverId,
          name: driver.name,
          password: "driver123", // Default password
          status: 'active', // Required field
          active: true, // For route optimization
          baseLocation: driver.baseLocation,
          area: driver.area,
          maxCapacity: Math.floor(Math.random() * 50) + 50, // 50-100 capacity
          onDuty: false,
          createdAt: serverTimestamp(), // Required field
          // Additional fields for route optimization
          vehicleCapacity: Math.floor(Math.random() * 50) + 50,
          driverName: driver.name
        });
        created++;
      } catch (error) {
        console.error('Error creating driver:', error);
      }
    }
    return created;
  };

  const handleCreateDelhiTestData = async () => {
    setIsCreating(true);
    setCreatedCounts({ reports: 0, drivers: 0 });

    try {
      // Create reports
      const reportsCreated = await createDelhiReports();
      setCreatedCounts(prev => ({ ...prev, reports: reportsCreated }));

      // Create drivers
      const driversCreated = await createDelhiDrivers();
      setCreatedCounts(prev => ({ ...prev, drivers: driversCreated }));

      toast({
        title: "Delhi Test Data Created Successfully! 🎉",
        description: `Created ${reportsCreated} reports across Delhi and ${driversCreated} drivers in different areas. Perfect for testing clustering!`,
      });

    } catch (error) {
      console.error('Error creating Delhi test data:', error);
      toast({
        title: "Error Creating Test Data",
        description: "Failed to create Delhi test data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-primary" />
          Delhi Comprehensive Test Data Setup
        </CardTitle>
        <CardDescription>
          Create extensive test data across Delhi to demonstrate route optimization and clustering
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Data Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Waste Reports ({delhiReports.length})
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Central Delhi:</span>
                <Badge variant="outline">{delhiReports.filter(r => r.area === 'Central Delhi').length} reports</Badge>
              </div>
              <div className="flex justify-between">
                <span>South Delhi:</span>
                <Badge variant="outline">{delhiReports.filter(r => r.area === 'South Delhi').length} reports</Badge>
              </div>
              <div className="flex justify-between">
                <span>East Delhi:</span>
                <Badge variant="outline">{delhiReports.filter(r => r.area === 'East Delhi').length} reports</Badge>
              </div>
              <div className="flex justify-between">
                <span>West Delhi:</span>
                <Badge variant="outline">{delhiReports.filter(r => r.area === 'West Delhi').length} reports</Badge>
              </div>
              <div className="flex justify-between">
                <span>North Delhi:</span>
                <Badge variant="outline">{delhiReports.filter(r => r.area === 'North Delhi').length} reports</Badge>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="text-red-600 font-medium">Urgent (Red):</span>
                <Badge variant="destructive">{delhiReports.filter(r => r.priority === 'red').length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600 font-medium">Moderate (Yellow):</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{delhiReports.filter(r => r.priority === 'yellow').length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-medium">Normal (Green):</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">{delhiReports.filter(r => r.priority === 'green').length}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Drivers ({delhiDrivers.length})
            </h3>
            <div className="space-y-2 text-sm">
              {delhiDrivers.map((driver, index) => (
                <div key={driver.driverId} className="flex justify-between items-center">
                  <span className="font-medium">{driver.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{driver.area}</Badge>
                    <Badge variant="secondary" className="text-xs">{driver.driverId}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What This Test Data Demonstrates:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Geographic Clustering:</strong> Reports spread across all Delhi areas</li>
            <li>• <strong>Priority Distribution:</strong> Mix of urgent, moderate, and normal priority reports</li>
            <li>• <strong>Driver Assignment:</strong> Drivers located in different areas for optimal clustering</li>
            <li>• <strong>Real-world Scenarios:</strong> Tourist areas, markets, residential zones, metro stations</li>
            <li>• <strong>Route Optimization:</strong> Perfect for testing the clustering algorithm</li>
          </ul>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleCreateDelhiTestData}
          disabled={isCreating}
          className="w-full gap-2"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Delhi Test Data...
            </>
          ) : (
            <>
              <Database className="h-5 w-5" />
              Create Delhi Test Data ({delhiReports.length} Reports + {delhiDrivers.length} Drivers)
            </>
          )}
        </Button>

        {createdCounts.reports > 0 && createdCounts.drivers > 0 && (
          <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-700">
                ✅ Delhi test data created successfully!
              </p>
              <p className="text-xs text-green-600">
                {createdCounts.reports} reports across Delhi + {createdCounts.drivers} drivers ready for testing
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DelhiTestDataSetup;
