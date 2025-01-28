import { api } from './client';

export interface TaskBreakdown {
  main_task: string;
  subtasks: string[];
  estimated_time: number;
  difficulty_level: number;
  energy_level_needed: number;
  context_switches: number;
  initiation_tips: string[];
  dopamine_hooks: string[];
  break_points: number[];
}

export interface AssistantMessage {
  user_id: string;
  content: string;
  timestamp: string;
  type: 'user' | 'assistant';
  category?: string;
}

export interface AssistantResponse {
  content: string;
  task_breakdown?: TaskBreakdown;
  suggested_tasks?: string[];
  calendar_suggestions?: any[];
  dopamine_boosters?: string[];
  focus_tips?: string[];
  executive_function_supports?: Array<{
    strategy: string;
    category: string;
  }>;
  environment_adjustments?: string[];
}

export const assistantApi = {
  sendMessage: async (message: string): Promise<AssistantResponse> => {
    const response = await api.post('/api/assistant/message', { message });
    return response.data;
  },

  sendVoiceMessage: async (audioData: string): Promise<AssistantResponse> => {
    const response = await api.post('/api/assistant/voice', { audio_data: audioData });
    return response.data;
  },

  getHistory: async (limit: number = 10): Promise<AssistantMessage[]> => {
    const response = await api.get(`/api/assistant/history?limit=${limit}`);
    return response.data;
  }
};