// Utility to create test reports for demonstrating the driver portal
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const createTestReportsForDriver = async (driverId: string, userId: string) => {
  try {
    console.log('🧪 Creating test reports for driver:', driverId);
    
    const testReports = [
      {
        description: "Large pile of plastic waste near community center entrance",
        reporterId: userId,
        coords: { lat: 28.6139, lng: 77.2090 },
        reportedAt: serverTimestamp(),
        status: 'assigned',
        priority: 'normal',
        driverId: driverId,
        assignedAt: new Date(),
        hasImage: true,
        imageId: 'demo_image_1'
      },
      {
        description: "Overflowing garbage bin at bus stop requires immediate attention",
        reporterId: userId,
        coords: { lat: 28.6129, lng: 77.2095 },
        reportedAt: serverTimestamp(),
        status: 'collected',
        priority: 'normal',
        driverId: driverId,
        assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        collectedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        hasImage: false
      },
      {
        description: "Illegal dumping of construction waste blocking road access",
        reporterId: userId,
        coords: { lat: 28.6149, lng: 77.2080 },
        reportedAt: serverTimestamp(),
        status: 'approved',
        priority: 'redflag',
        driverId: driverId,
        assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        collectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        approvedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        hasImage: true,
        imageId: 'demo_image_2'
      },
      {
        description: "Scattered paper and food waste in park area",
        reporterId: userId,
        coords: { lat: 28.6159, lng: 77.2070 },
        reportedAt: serverTimestamp(),
        status: 'assigned',
        priority: 'normal',
        driverId: driverId,
        assignedAt: new Date(),
        hasImage: false
      }
    ];

    const createdReports = [];
    for (const report of testReports) {
      const docRef = await addDoc(collection(db, 'reports'), report);
      createdReports.push({ id: docRef.id, ...report });
      console.log('✅ Created test report:', docRef.id);
    }

    console.log('🎉 Successfully created', createdReports.length, 'test reports');
    return createdReports;
  } catch (error) {
    console.error('❌ Error creating test reports:', error);
    throw error;
  }
};

// Function to be called from browser console for testing
(window as any).createTestReports = async () => {
  try {
    // You'll need to provide the actual driver ID and user ID
    const driverId = 'DRV001'; // Replace with actual driver ID
    const userId = 'test_citizen_user'; // Replace with actual user ID
    
    const reports = await createTestReportsForDriver(driverId, userId);
    console.log('Test reports created:', reports);
    return reports;
  } catch (error) {
    console.error('Failed to create test reports:', error);
  }
};
