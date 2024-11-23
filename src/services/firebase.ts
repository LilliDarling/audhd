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

const firebaseConfig = {
  apiKey: "AIzaSyA6Qj52fPc4lr94tztbfjlxw2S_QPUrXDE",
  authDomain: "audhd-dev.firebaseapp.com",
  projectId: "audhd-dev",
  storageBucket: "audhd-dev.appspot.com",
  messagingSenderId: "270410028225",
  appId: "1:270410028225:ios:517482661bb0c87843f040"
};

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
