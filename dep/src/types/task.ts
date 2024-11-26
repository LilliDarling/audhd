// src/types/task.ts
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'personal' | 'work' | 'health' | 'chores' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  userId: string;
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'userId'>;
