import { useState, useCallback, useEffect, useRef } from 'react';
import { assistantApi, AssistantMessage, AssistantResponse } from '@/lib/api/assistant';
import axios, { CancelTokenSource } from 'axios';
import { useAuth } from '../context/AuthContext';
import _ from 'lodash';


interface PendingRequest {
  content: string;
  abortController: AbortController;
}


export function useAssistant() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingRequestRef = useRef<PendingRequest | null>(null);
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  const cancelPendingRequest = useCallback(() => {
    if (pendingRequestRef.current?.abortController) {
      pendingRequestRef.current.abortController.abort();
      pendingRequestRef.current = null;
    }
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Operation cancelled by user');
      cancelTokenSourceRef.current = null;
    }
  }, []);

  const debouncedSendMessage = useCallback(
    _.debounce(async (content: string): Promise<AssistantResponse> => {
      if (!isAuthenticated || !user) {
        throw new Error('Please log in to use the assistant.');
      }

      // Cancel any existing request
      cancelPendingRequest();

      // Create new abort controller and cancel token
      const abortController = new AbortController();
      const cancelTokenSource = axios.CancelToken.source();
      
      pendingRequestRef.current = { content, abortController };
      cancelTokenSourceRef.current = cancelTokenSource;

      try {
        const response = await axios.post<AssistantResponse>(
          '/api/assistant/message', 
          { message: content },
          {
            withCredentials: true,
            timeout: 45000, // Increased timeout
            signal: abortController.signal,
            cancelToken: cancelTokenSource.token,
            headers: {
              'Content-Type': 'application/json',
            },
            validateStatus: (status) => status === 200,
          }
        );

        if (!response.data?.content) {
          throw new Error('Invalid response from assistant');
        }

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Please log in to use the assistant.');
          }
          if (error.response?.status === 504) {
            throw new Error('Request timed out. Please try again.');
          }
          throw new Error(error.response?.data?.detail || 'Failed to send message');
        }
        throw error;
      }
    }, 300),
    [isAuthenticated, user, cancelPendingRequest]
  );

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
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
    setError(null);
    
    try {
      // Add user message immediately
      const userMessage: AssistantMessage = {
        user_id: user?.id ?? '',
        content,
        timestamp: new Date().toISOString(),
        type: 'user'
      };
      setMessages(prev => [...prev, userMessage]);

      // Send message and wait for response
      const response = await debouncedSendMessage(content);
      
      // Add assistant message
      const assistantMessage: AssistantMessage = {
        user_id: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        type: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err;
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
    return () => {
      cancelPendingRequest();
    };
  }, [isAuthenticated, loadHistory, cancelPendingRequest]);

  return {
    messages,
    isLoading: isLoading || authLoading,
    error,
    sendMessage,
    sendVoiceMessage,
    refreshHistory: loadHistory,
    isAuthenticated,
    cancelPendingRequest
  };
}