import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { router } from 'expo-router';
import { AuthState, UserResponse, SignInRequest, SignUpRequest } from '@/types/auth';
import { authApi } from '@/lib/api/auth';

interface AuthContextType extends AuthState {
  signIn: (credentials: SignInRequest) => Promise<void>;
  signUp: (userData: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

type AuthAction =
  | { type: 'SET_USER'; payload: UserResponse }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SIGN_OUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await authApi.checkAuth();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '' });
    }
  }

  async function signIn(credentials: SignInRequest) {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await authApi.signIn(credentials);
      dispatch({ type: 'SET_USER', payload: user });
      router.replace("./../(tabs)");
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.detail || 'Authentication failed' 
      });
      throw error;
    }
  }

  async function signUp(userData: SignUpRequest) {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await authApi.signUp(userData);
      dispatch({ type: 'SET_USER', payload: user });
      router.replace("./../(tabs)");
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.detail || 'Registration failed' 
      });
      throw error;
    }
  }

  async function signOut() {
    try {
      await authApi.signOut();
      dispatch({ type: 'SIGN_OUT' });
      router.replace("./../(auth)/login");
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.detail || 'Sign out failed' 
      });
    }
  }

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}