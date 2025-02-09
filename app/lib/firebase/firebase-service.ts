/**
 * Firebase authentication service module.
 * Provides methods for user authentication and session management.
 * @module
 */

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase-config';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * User response structure from Firebase Authentication
 * @interface
 */
export interface FirebaseUserResponse {
  user: User;
}

// ============================================================================
// Authentication Services
// ============================================================================

/**
 * Retrieves the current authenticated user and their session
 * Utilizes Firebase's onAuthStateChanged to provide real-time auth state
 * @returns {Promise<{ user: User | null }>} Current user object or null
 * @throws {Error} If there's an error accessing Firebase Auth
 */
export const getCurrentUser = async () => {
  try {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user ? { user } : null);
      });
    });
  } catch (error) {
    console.error("[error getting user] ==>", error);
    return null;
  }
};

/**
 * Authenticates a user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<FirebaseUserResponse | undefined>} Authenticated user data
 * @throws {Error} If authentication fails
 */
export async function login(
  email: string, 
  password: string
): Promise<FirebaseUserResponse | undefined> {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    return { user: userCredential.user };
  } catch (e) {
    console.error("[error logging in] ==>", e);
    throw e;
  }
}

/**
 * Logs out the current user by terminating their session
 * @returns {Promise<void>}
 * @throws {Error} If logout fails
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("[error logging out] ==>", e);
    throw e;
  }
}

/**
 * Creates a new user account and optionally sets their display name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} [name] - Optional user's display name
 * @returns {Promise<FirebaseUserResponse | undefined>} Created user data
 * @throws {Error} If registration fails
 */
export async function register(
  email: string,
  password: string,
  name?: string
): Promise<FirebaseUserResponse | undefined> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return { user: userCredential.user };
  } catch (e) {
    console.error("[error registering] ==>", e);
    throw e;
  }
}
