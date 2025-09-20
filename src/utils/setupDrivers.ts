import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { UserProfile } from '@/contexts/AuthContext';

// This is a utility function to set up initial driver accounts
// Run this once to create driver accounts for testing
export const setupInitialDrivers = async () => {
  const drivers = [
    { driverId: 'DRV001', name: 'Rajesh Kumar', password: 'driver123' },
    { driverId: 'DRV002', name: 'Suresh Sharma', password: 'driver123' },
    { driverId: 'DRV003', name: 'Amit Singh', password: 'driver123' },
    { driverId: 'DRV004', name: 'Vikash Yadav', password: 'driver123' },
    { driverId: 'DRV005', name: 'Ramesh Gupta', password: 'driver123' },
  ];

  for (const driver of drivers) {
    try {
      const driverEmail = `${driver.driverId.toLowerCase()}@drivers.swachhsaarthi.com`;
      
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        driverEmail, 
        driver.password
      );
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: driver.name
      });

      // Create driver profile in Firestore
      const driverProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: driverEmail,
        displayName: driver.name,
        userType: 'driver',
        driverId: driver.driverId,
        points: 0,
        rank: 'New Driver'
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), driverProfile);
      
      console.log(`Driver ${driver.driverId} (${driver.name}) created successfully`);
    } catch (error) {
      console.error(`Error creating driver ${driver.driverId}:`, error);
    }
  }
};

// Sample function to create a new driver account
export const createDriverAccount = async (
  driverId: string, 
  driverName: string, 
  password: string
) => {
  try {
    const driverEmail = `${driverId.toLowerCase()}@drivers.swachhsaarthi.com`;
    
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      driverEmail, 
      password
    );
    
    await updateProfile(userCredential.user, {
      displayName: driverName
    });

    const driverProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: driverEmail,
      displayName: driverName,
      userType: 'driver',
      driverId: driverId,
      points: 0,
      rank: 'New Driver'
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), driverProfile);
    
    return { success: true, message: `Driver ${driverId} created successfully` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
