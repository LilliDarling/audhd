export interface Task {
    id: string;
    title: string;
    description: string;
    priority: number;
    status: string;
    context?: {
      time_of_day: string;
      energy_level: number;
      environment: string;
      current_medications: boolean;
    };
    breakdown?: {
      steps: {
        description: string;
        time_estimate: number;
        initiation_tip: string;
        completion_signal: string;
        focus_strategy: string;
        dopamine_hook: string;
      }[];
      suggested_breaks: number[];
      initiation_strategy: string;
      energy_level_needed: number;
      materials_needed: string[];
      environment_setup: string[];
    };
}