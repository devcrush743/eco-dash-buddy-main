// Quick script to create test drivers for immediate testing
// Run this in browser console on admin page

const createTestDrivers = async () => {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('./src/config/firebase.js');
  
  const testDrivers = [
    {
      driverId: "DEL001",
      name: "Rajesh Kumar",
      password: "driver123",
      status: 'active',
      active: true,
      baseLocation: { lat: 28.6129, lng: 77.2295 },
      area: "Central Delhi",
      maxCapacity: 80,
      onDuty: false,
      createdAt: serverTimestamp(),
      vehicleCapacity: 80,
      driverName: "Rajesh Kumar"
    },
    {
      driverId: "DEL002", 
      name: "Priya Sharma",
      password: "driver123",
      status: 'active',
      active: true,
      baseLocation: { lat: 28.5355, lng: 77.2149 },
      area: "South Delhi",
      maxCapacity: 75,
      onDuty: false,
      createdAt: serverTimestamp(),
      vehicleCapacity: 75,
      driverName: "Priya Sharma"
    },
    {
      driverId: "DEL003",
      name: "Amit Singh", 
      password: "driver123",
      status: 'active',
      active: true,
      baseLocation: { lat: 28.6358, lng: 77.2750 },
      area: "East Delhi",
      maxCapacity: 90,
      onDuty: false,
      createdAt: serverTimestamp(),
      vehicleCapacity: 90,
      driverName: "Amit Singh"
    }
  ];

  console.log('Creating test drivers...');
  
  for (const driver of testDrivers) {
    try {
      const docRef = await addDoc(collection(db, 'drivers'), driver);
      console.log(`✅ Created driver ${driver.driverId}: ${driver.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Failed to create driver ${driver.driverId}:`, error);
    }
  }
  
  console.log('Test drivers creation completed!');
};

// Run the function
createTestDrivers();
