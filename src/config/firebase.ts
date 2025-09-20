// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCjcKcuYHERGfvjtJU37RSRMoolByxpyQY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "swachhsaarthi.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "swachhsaarthi",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "swachhsaarthi.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "297316109839",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:297316109839:web:cac761f1833c0287d1dd7a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QLDKR4476H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

// Initialize Firebase Auth and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Storage and get a reference to the service
export const storage = getStorage(app);

export default app;