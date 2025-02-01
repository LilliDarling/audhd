import { useState, useCallback, useEffect } from 'react';
import { assistantApi, AssistantMessage, AssistantResponse } from '@/lib/api/assistant';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export function useAssistant() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const token = user?.token;
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const history = await assistantApi.getHistory();
      setMessages(history);
    } catch (err) {
      setError('Failed to load message history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const sendMessage = async (content: string): Promise<AssistantResponse> => {
    if (!isAuthenticated || !user) {
      throw new Error('Please log in to use the assistant.');
    }

    setIsLoading(true);
    try {
      console.log("Starting to send message:", content);
      const userMessage: AssistantMessage = {
        user_id: user.id,
        content: content,
        timestamp: new Date().toISOString(),
        type: 'user'
      };
      setMessages(prev => [...prev, userMessage]);

      console.log("Making API request...");
      const response = await axios.post<AssistantResponse>(
        '/api/assistant/message', 
        { message: content },
        {
          withCredentials: true
        }
      );
      console.log("Received API response:", response.data);

      if (!response.data || !response.data.content) {
        throw new Error('Invalid response from assistant');
      }

      const assistantMessage: AssistantMessage = {
        user_id: 'assistant',
        content: response.data.content,
        timestamp: new Date().toISOString(),
        type: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

      return response.data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Please log in to use the assistant.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoiceMessage = useCallback(async (audioData: string): Promise<AssistantResponse> => {
    if (!isAuthenticated || !user) {
      throw new Error('Please log in to use the assistant.');
    }

    try {
      setIsLoading(true);
      const response = await assistantApi.sendVoiceMessage(audioData);
      
      setMessages(prev => [
        ...prev,
        {
          user_id: user.id,
          content: '🎤 Voice message',
          timestamp: new Date().toISOString(),
          type: 'user'
        },
        {
          user_id: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          type: 'assistant'
        }
      ]);
      
      return response;
    } catch (err) {
      setError('Failed to send voice message');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, loadHistory]);

  return {
    messages,
    isLoading: isLoading || authLoading,
    error,
    sendMessage,
    sendVoiceMessage,
    refreshHistory: loadHistory,
    isAuthenticated
  };
}