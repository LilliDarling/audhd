import { AssistantMessage, AssistantResponse } from '@/types/assistant';
import { api } from './client';


export const assistantApi = {
  sendMessage: async (message: string): Promise<AssistantResponse> => {
    console.log('Sending message:', message);
    try {
      const response = await api.post('/api/assistant/message', { message });
      console.log('Raw API response:', response);
      
      if (!response.data || typeof response.data === 'string' || !response.data.content) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      if (error.response?.status === 401) {
        throw new Error('Please log in to use the assistant');
      }
      throw error;
    }
  },

  sendVoiceMessage: async (audioData: string): Promise<AssistantResponse> => {
    console.log('Sending voice message');
    try {
      const response = await api.post('/api/assistant/voice', { audio_data: audioData });
      console.log('Voice message response:', response.data);
      
      if (!response.data || typeof response.data === 'string' || !response.data.content) {
        console.error('Invalid voice response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error sending voice message:', {
        error,
        status: error.response?.status,
        data: error.response?.data
      });
      if (error.response?.status === 401) {
        throw new Error('Please log in to use the assistant');
      }
      throw error;
    }
  },

  getHistory: async (limit: number = 10): Promise<AssistantMessage[]> => {
    console.log('Getting message history, limit:', limit);
    try {
      const response = await api.get(`/api/assistant/history?limit=${limit}`);
      console.log('History response:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.error('Invalid history response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error getting history:', {
        error,
        status: error.response?.status,
        data: error.response?.data
      });
      if (error.response?.status === 401) {
        throw new Error('Please log in to view message history');
      }
      throw error;
    }
  }
};