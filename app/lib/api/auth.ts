import { api } from './client';

interface SignInRequest {
  username: string;
  password: string;
}

interface UserResponse {
  id: string;
  username: string;
}

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<UserResponse> => {
    const response = await api.post('/api/auth/signin', credentials);
    return response.data;
  },

  signOut: async () => {
    await api.delete('/api/auth/signout');
  },

  checkAuth: async (): Promise<UserResponse> => {
    const response = await api.get('/api/auth/authenticate');
    return response.data;
  }
};