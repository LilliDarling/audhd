import { useState, useCallback, useEffect } from 'react';
import { assistantApi, AssistantMessage, AssistantResponse } from '@/lib/api/assistant';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export function useAssistant() {
  const { user } = useAuth(); // Access the authenticated user
  const token = user?.token;
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
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
  }, []);

  const sendMessage = async (content: string) => {
    if (!token) {
      throw new Error('No JWT token found. Please log in.');
    }

    try {
      const response = await axios.post('/api/assistant/message', { message: content }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const sendVoiceMessage = useCallback(async (audioData: string) => {
    try {
      setIsLoading(true);
      const response = await assistantApi.sendVoiceMessage(audioData);
      setMessages(prev => [
        ...prev,
        {
          user_id: 'current',
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
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    sendVoiceMessage,
    refreshHistory: loadHistory
  };
}