import React from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import TaskForm from '@/lib/components/tasks/TaskForm';
import { useTasks } from '@/lib/hooks/useTasks';

export default function CreateTaskScreen() {
  const { createTask } = useTasks();

  const handleCreate = async (data: any) => {
    await createTask(data);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Create Task' }} />
      <View className="flex-1 bg-gray-50 p-4">
        <TaskForm onSubmit={handleCreate} />
      </View>
    </>
  );
}