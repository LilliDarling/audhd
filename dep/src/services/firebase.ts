// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  Auth,
  UserCredential
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth: Auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  console.log('Attempting to sign in:', email);
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  console.log('Attempting to sign up:', email);
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};
