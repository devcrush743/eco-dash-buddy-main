// Quick script to create test reports for immediate testing
// Run this in browser console on admin page

const createTestReports = async () => {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('./src/config/firebase.js');
  
  const testReports = [
    {
      description: "URGENT: Overflowing garbage bins near India Gate - tourist area",
      coords: { lat: 28.6129, lng: 77.2295 },
      status: "open",
      priority: "red",
      area: "Central Delhi",
      reportedAt: serverTimestamp(),
      reporterId: "test_citizen_1"
    },
    {
      description: "Large waste pile near Connaught Place metro station",
      coords: { lat: 28.6315, lng: 77.2167 },
      status: "open", 
      priority: "red",
      area: "Central Delhi",
      reportedAt: serverTimestamp(),
      reporterId: "test_citizen_2"
    },
    {
      description: "Plastic bottles scattered in Hauz Khas park",
      coords: { lat: 28.5478, lng: 77.1944 },
      status: "open",
      priority: "yellow",
      area: "South Delhi", 
      reportedAt: serverTimestamp(),
      reporterId: "test_citizen_3"
    },
    {
      description: "Food waste near Green Park metro station",
      coords: { lat: 28.5400, lng: 77.2000 },
      status: "open",
      priority: "green",
      area: "South Delhi",
      reportedAt: serverTimestamp(),
      reporterId: "test_citizen_4"
    },
    {
      description: "Large garbage dump near Laxmi Nagar metro",
      coords: { lat: 28.6358, lng: 77.2750 },
      status: "open",
      priority: "red",
      area: "East Delhi",
      reportedAt: serverTimestamp(),
      reporterId: "test_citizen_5"
    },
    {
      description: "Mixed waste near Rajouri Garden metro",
      coords: { lat: 28.6500, lng: 77.1200 },
      status: "open",
      priority: "yellow",
      area: "West Delhi",
      reportedAt: serverTimestamp(),
      reporterId: "test_citizen_6"
    }
  ];

  console.log('Creating test reports...');
  
  for (const report of testReports) {
    try {
      const docRef = await addDoc(collection(db, 'reports'), report);
      console.log(`✅ Created report: ${report.description.substring(0, 50)}... (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Failed to create report:`, error);
    }
  }
  
  console.log('Test reports creation completed!');
};

// Run the function
createTestReports();