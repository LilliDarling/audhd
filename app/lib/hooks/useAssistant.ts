import { useState, useCallback, useEffect, useRef } from 'react';
import { AssistantMessage, AssistantResponse, PendingRequest } from '@/types/assistant';
import axios, { CancelTokenSource } from 'axios';
import { useAuth } from '../context/AuthContext';
import { assistantApi } from '../api/assistant';


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

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const history = await assistantApi.getHistory();
      setMessages(history);
    } catch (error) {
      setError('Failed to load message history');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const sendMessage = async (content: string): Promise<AssistantResponse> => {
    if (!isAuthenticated || !user) {
      throw new Error('Please log in to use the assistant.');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const userMessage: AssistantMessage = {
        user_id: user.id,
        content,
        timestamp: new Date().toISOString(),
        type: 'user'
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await assistantApi.sendMessage(content);
      
      const assistantMessage: AssistantMessage = {
        user_id: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        type: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
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