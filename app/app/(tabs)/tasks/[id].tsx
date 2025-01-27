import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTasks } from '@/lib/hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { tasks, updateTask, deleteTask } = useTasks();
  
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <View>
        <Text>Task not found</Text>
      </View>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      router.back();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateTask(task.id, { ...task, status: newStatus });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Task Details',
          headerRight: () => (
            <Pressable onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </Pressable>
          ),
        }}
      />
      
      <View>
        <Text>{task.title}</Text>
        <Text>{task.description}</Text>
        <Text>Priority: {task.priority}</Text>
        <Text>Status: {task.status}</Text>

        <View>
          <Text>Update Status:</Text>
          {['pending', 'in_progress', 'completed'].map((status) => (
            <Pressable
              key={status}
              onPress={() => handleUpdateStatus(status)}
            >
              <Text>{status}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
}