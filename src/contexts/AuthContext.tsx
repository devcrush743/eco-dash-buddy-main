import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/config/firebase';
import { authenticateDriver } from '@/utils/driverHelpers';
import { useNavigate } from 'react-router-dom';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  userType: 'citizen' | 'driver' | 'admin';
  driverId?: string; // Special ID for drivers
  photoURL?: string;
  points?: number;
  rank?: string;
  // For admin-created drivers (Firestore-only)
  isDriverAccount?: boolean;
  driverData?: any; // Driver data from Firestore
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  
  // Citizen authentication
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  
  // Driver authentication
  signInDriver: (driverId: string, password: string) => Promise<void>;
  
  // General
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (user: User) => {
    try {
      console.log('🔍 Fetching user profile for UID:', user.uid);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        console.log('✅ User profile found:', profileData);
        setUserProfile(profileData);
      } else {
        console.log('👤 Creating new user profile...');
        // Create default citizen profile if doesn't exist
        const defaultProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'User',
          userType: 'citizen',
          points: 0,
          rank: 'Eco Beginner'
        };
        
        console.log('💾 Writing user profile to Firestore:', defaultProfile);
        await setDoc(doc(db, 'users', user.uid), defaultProfile);
        console.log('✅ User profile created successfully');
        setUserProfile(defaultProfile);
      }
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // More specific error handling
      if (error.code === 'permission-denied') {
        console.error('💡 Solution: Check Firestore security rules');
      } else if (error.code === 'unavailable') {
        console.error('💡 Solution: Check internet connection and Firebase project status');
      }
    }
  };

  // Google Sign In for Citizens
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await fetchUserProfile(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Email/Password Sign In for Citizens
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserProfile(result.user);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  // Email/Password Sign Up for Citizens
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // Create citizen profile
      const citizenProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName,
        userType: 'citizen',
        points: 0,
        rank: 'Eco Beginner'
      };
      
      await setDoc(doc(db, 'users', result.user.uid), citizenProfile);
      setUserProfile(citizenProfile);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  // Driver Sign In with Admin-Created Account (Firestore-only)
  const signInDriver = async (driverId: string, password: string) => {
    try {
      console.log(`🔍 Attempting driver login: ${driverId} with password: ${password}`);
      
      // Authenticate using Firestore-only system
      const authResult = await authenticateDriver(driverId, password);
      
      console.log('🔍 Auth result:', authResult);
      
      if (!authResult.success || !authResult.driver) {
        console.error('❌ Driver authentication failed:', authResult.error);
        throw new Error(authResult.error || 'Authentication failed');
      }

      console.log('✅ Driver found:', authResult.driver);

      // Create a mock user object for consistency with existing auth flow
      const mockUser = {
        uid: `driver_${authResult.driver.id}`,
        email: `${authResult.driver.driverId}@drivers.local`,
        displayName: authResult.driver.name,
      } as User;

      // Create user profile for driver
      const driverProfile: UserProfile = {
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: authResult.driver.name,
        userType: 'driver',
        driverId: authResult.driver.driverId,
        points: 0,
        rank: 'Driver',
        isDriverAccount: true,
        driverData: authResult.driver
      };

      console.log('🔍 Setting user profile:', driverProfile);

      // Set state to simulate Firebase Auth flow
      setCurrentUser(mockUser);
      setUserProfile(driverProfile);
      
      // Important: Set loading to false AFTER setting the profile
      setTimeout(() => {
        setLoading(false);
      }, 50);

      console.log(`✅ Driver signed in successfully: ${authResult.driver.driverId} (${authResult.driver.name})`);
    } catch (error: any) {
      console.error('❌ Error signing in driver:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Check if this is a driver account (Firestore-only)
      if (userProfile?.isDriverAccount) {
        // For driver accounts, just clear local state
        setCurrentUser(null);
        setUserProfile(null);
        console.log('✅ Driver logged out');
      } else {
        // For Firebase Auth users (citizens)
        await signOut(auth);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔍 Firebase auth state changed:', user?.uid || 'null', 'isDriverAccount:', userProfile?.isDriverAccount);
      
      // Only update state for Firebase Auth users (citizens)
      // Driver accounts are managed separately and should not be affected by Firebase auth state
      if (!userProfile?.isDriverAccount) {
        setCurrentUser(user);
        if (user) {
          await fetchUserProfile(user);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      } else {
        // For driver accounts, ignore Firebase auth state changes completely
        console.log('🔍 Ignoring Firebase auth state change for driver account');
      }
    });

    return unsubscribe;
  }, [userProfile?.isDriverAccount]);

  // Auto-redirect after profile is loaded
  useEffect(() => {
    if (currentUser && userProfile && !loading) {
      const currentPath = window.location.pathname;
      const shouldRedirect = currentPath === '/' || currentPath === '/login';
      
      if (shouldRedirect) {
        const targetPath = userProfile.userType === 'citizen' ? '/citizen' : 
                          userProfile.userType === 'driver' ? '/driver' : '/admin';
        console.log(`🚀 Redirecting ${userProfile.userType} to ${targetPath}`);
        
        // Use React Router for navigation to prevent auth state loss
        // This prevents issues on Netlify and other hosting platforms
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            // Trigger a route change event for React Router
            const event = new CustomEvent('auth-redirect', { detail: { path: targetPath } });
            window.dispatchEvent(event);
          }
        }, 100);
      }
    }
  }, [currentUser, userProfile, loading]);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInDriver,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
