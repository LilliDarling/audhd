import { useState, useCallback, useEffect } from 'react';
import { assistantApi, AssistantMessage, AssistantResponse } from '@/lib/api/assistant';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import _ from 'lodash';

export function useAssistant() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSendMessage = useCallback(
    _.debounce(async (content: string): Promise<AssistantResponse> => {
      if (!isAuthenticated || !user) {
        throw new Error('Please log in to use the assistant.');
      }

      try {
        const response = await axios.post<AssistantResponse>(
          '/api/assistant/message', 
          { message: content },
          {
            withCredentials: true,
            // Add timeout
            timeout: 30000,
            // Add retry logic
            validateStatus: (status) => status === 200
          }
        );

        if (!response.data?.content) {
          throw new Error('Invalid response from assistant');
        }

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          throw new Error('Please log in to use the assistant.');
        }
        throw error;
      }
    }, 300),
    [isAuthenticated, user]
  );

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
    setIsLoading(true);
    try {
      const userMessage: AssistantMessage = {
        user_id: user?.id ?? '',
        content,
        timestamp: new Date().toISOString(),
        type: 'user'
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await debouncedSendMessage(content);
      
      const assistantMessage: AssistantMessage = {
        user_id: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        type: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

      return response;
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