// Setup test data for Route Optimization
// Run this in your browser console on your app

// 1. First, create test reports
const createTestReports = async () => {
  const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const { db } = await import('./src/config/firebase.js');
  
  const testReports = [
    {
      description: "Large garbage pile near school entrance",
      coords: { lat: 28.6139, lng: 77.2090 },
      status: "open",
      priority: "red",
      reportedAt: serverTimestamp(),
      reporterId: "test_user_1"
    },
    {
      description: "Plastic bottles scattered in park",
      coords: { lat: 28.6140, lng: 77.2095 },
      status: "open", 
      priority: "yellow",
      reportedAt: serverTimestamp(),
      reporterId: "test_user_2"
    },
    {
      description: "Food waste and organic matter",
      coords: { lat: 28.6145, lng: 77.2100 },
      status: "open",
      priority: "green", 
      reportedAt: serverTimestamp(),
      reporterId: "test_user_3"
    },
    {
      description: "Construction debris blocking road",
      coords: { lat: 28.6150, lng: 77.2105 },
      status: "open",
      priority: "red",
      reportedAt: serverTimestamp(),
      reporterId: "test_user_4"
    },
    {
      description: "Electronic waste collection",
      coords: { lat: 28.6155, lng: 77.2110 },
      status: "open",
      priority: "yellow",
      reportedAt: serverTimestamp(),
      reporterId: "test_user_5"
    }
  ];

  console.log('Creating test reports...');
  for (const report of testReports) {
    try {
      const docRef = await addDoc(collection(db, 'reports'), report);
      console.log(`✅ Created report: ${report.description} (ID: ${docRef.id})`);
    } catch (error) {
      console.error('❌ Error creating report:', error);
    }
  }
};

// 2. Create test drivers
const createTestDrivers = async () => {
  const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const { db } = await import('./src/config/firebase.js');
  
  const testDrivers = [
    {
      driverId: "DRIVER001",
      name: "John Smith",
      active: true,
      baseLocation: { lat: 28.6100, lng: 77.2050 },
      maxCapacity: 100,
      onDuty: false
    },
    {
      driverId: "DRIVER002", 
      name: "Sarah Johnson",
      active: true,
      baseLocation: { lat: 28.6200, lng: 77.2150 },
      maxCapacity: 80,
      onDuty: false
    },
    {
      driverId: "DRIVER003",
      name: "Mike Wilson", 
      active: true,
      baseLocation: { lat: 28.6000, lng: 77.2000 },
      maxCapacity: 120,
      onDuty: false
    }
  ];

  console.log('Creating test drivers...');
  for (const driver of testDrivers) {
    try {
      const docRef = await addDoc(collection(db, 'drivers'), driver);
      console.log(`✅ Created driver: ${driver.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error('❌ Error creating driver:', error);
    }
  }
};

// Run both functions
const setupAllTestData = async () => {
  console.log('🚀 Setting up test data for Route Optimization...');
  await createTestReports();
  await createTestDrivers();
  console.log('✅ Test data setup complete! You can now test route optimization.');
};

// Export for use
window.setupTestData = setupAllTestData;
