import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import TaskForm from '@/lib/components/tasks/TaskForm';
import { useTasks } from '@/lib/hooks/useTasks';

export default function CreateTaskScreen() {
  const { createTask } = useTasks();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: any) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await createTask(data);
      router.back();
    } catch (error) {
      console.error('Failed to create task:', error);
      Alert.alert(
        'Error',
        'Failed to create task. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View>
      <TaskForm onSubmit={handleCreate} />
    </View>
  );
}