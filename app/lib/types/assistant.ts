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
  
export interface ExecutiveFunctionSupport {
    strategy: string;
    category: string;
}
  
export interface CalendarSuggestion {
    tip: string;
    type: string;
}
  
export interface AssistantResponse {
    content: string;
    task_breakdown?: TaskBreakdown;
    suggested_tasks?: string[];
    calendar_suggestions?: CalendarSuggestion[];
    dopamine_boosters?: string[];
    focus_tips?: string[];
    executive_function_supports?: ExecutiveFunctionSupport[];
    environment_adjustments?: string[];
}

export interface AssistantMessage {
    user_id: string;
    content: string;
    timestamp: string;
    type: 'user' | 'assistant';
    category?: string;
}

export interface MessageBubbleProps {
    message: AssistantMessage;
    suggestions?: {
        task_breakdown?: {
            main_task: string;
            subtasks: string[];
            estimated_time: number;
            difficulty_level: number;
            energy_level_needed: number;
            context_switches: number;
            initiation_tips: string[];
            dopamine_hooks: string[];
            break_points: number[];
        };
        calendar_suggestions?: Array<{ tip: string; type: string }>;
        dopamine_boosters?: string[];
        focus_tips?: string[];
        executive_function_supports?: Array<{ strategy: string; category: string }>;
        environment_adjustments?: string[];
    };
    isLoading?: boolean;
}

export interface PendingRequest {
    content: string;
    abortController: AbortController;
}