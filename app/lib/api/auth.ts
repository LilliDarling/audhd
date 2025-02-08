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

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authApi = {
  setAuthToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getAuthToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeAuthToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  signIn: async (credentials: SignInRequest): Promise<UserResponse> => {
    try {
      const response = await api.post<UserResponse>('/api/auth/signin', credentials);
      const { token, ...userData } = response.data;
      if (token) {
        authApi.setAuthToken(token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
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
      const { token, ...user } = response.data;
      if (token) {
        authApi.setAuthToken(token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      return response.data;
    } catch (error: any) {
      console.log({ error })
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
    } finally {
      authApi.removeAuthToken();
    }
  },

  checkAuth: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>('/api/auth/authenticate');
      const { token, ...userData } = response.data;
      if (token) {
        authApi.setAuthToken(token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        authApi.removeAuthToken();
        throw new AuthenticationError('Session expired');
      }
      throw error;
    }
  }
};