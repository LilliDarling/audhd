import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TaskForm from '@/lib/components/tasks/TaskForm';
import { tasksApi } from '@/lib/api/tasks';
import { Task } from '@/lib/types/tasks';


export default function EditTaskScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [id]);

  async function loadTask() {
    if (!id) return;
    try {
      const taskData = await tasksApi.getTask(id.toString());
      setTask(taskData);
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (data: any) => {
    if (!task) return;
    try {
      await tasksApi.updateTask(task.id, data);
      router.back();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (isLoading || !task) {
    return null;
  }

  return (
    <ScrollView>
      <TaskForm 
        onSubmit={handleSubmit}
        initialData={task}
      />
    </ScrollView>
  );
}