import { useState, useEffect } from 'react';
import { tasksApi } from '@/lib/api/tasks';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await tasksApi.getTasks();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const newTask = await tasksApi.createTask(taskData);
      setTasks(currentTasks => [...currentTasks, newTask]);
      return newTask;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create task');
    }
  };

  const updateTask = async (id: string, taskData: Partial<Omit<Task, 'id'>>) => {
    try {
      const updatedTask = await tasksApi.updateTask(id, taskData);
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === id ? updatedTask : task
        )
      );
      return updatedTask;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);
      setTasks(currentTasks => currentTasks.filter(task => task.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete task');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks
  };
}