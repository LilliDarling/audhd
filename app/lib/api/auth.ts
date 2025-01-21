import { api } from './client';
import { SignInRequest, SignUpRequest, UserResponse, AuthError } from '@/types/auth';

class AuthenticationError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public field?: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<UserResponse> => {
    try {
      const response = await api.post<UserResponse>('/api/auth/signin', credentials);
      return response.data;
    } catch (error: any) {
      const authError: AuthError = error.response?.data || { detail: 'Authentication failed' };
      throw new AuthenticationError(
        authError.detail,
        authError.code,
        authError.field
      );
    }
  },

  signUp: async (userData: SignUpRequest): Promise<UserResponse> => {
    try {
      const response = await api.post<UserResponse>('/api/auth/signup', userData);
      return response.data;
    } catch (error: any) {
      const authError: AuthError = error.response?.data || { detail: 'Registration failed' };
      throw new AuthenticationError(
        authError.detail,
        authError.code,
        authError.field
      );
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await api.delete('/api/auth/signout');
    } catch (error: any) {
      throw new AuthenticationError('Failed to sign out');
    }
  },

  checkAuth: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>('/api/auth/authenticate');
      return response.data;
    } catch (error: any) {
      throw new AuthenticationError('Authentication check failed');
    }
  }
};