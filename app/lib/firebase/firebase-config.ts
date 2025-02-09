/**
 * Firebase configuration and initialization module.
 * This module handles the setup of Firebase services for the application.
 * @module
 */
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth,  } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// IGNORE IMPORT ERROR, this is a valid import, still investigating
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// https://stackoverflow.com/questions/76961682/typeerror-0-auth-getreactnativepersistence-is-not-a-function
//@ts-ignore
// import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Firebase configuration object containing necessary credentials and endpoints
 * @type {Object}
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// ============================================================================
// Firebase Initialization
// ============================================================================

/**
 * Initialize Firebase application instance
 * @type {FirebaseApp}
 */
const app = initializeApp(firebaseConfig);

initializeAuth(app, {
  // persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

/**
 * Initialize Firebase Authentication service
 * @type {Auth}
 */
const auth = getAuth(app);
const db = getFirestore(app); 

export { auth, db };
export default app;
