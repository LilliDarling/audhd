import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTasks } from '@/lib/hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';
import { tasksApi } from '@/lib/api/tasks';
import { Task } from '@/lib/types/tasks'

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { updateTask, deleteTask } = useTasks();
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

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask(task.id);
      router.back();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!task) return;
    try {
      const updatedTask = await updateTask(task.id, { 
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: newStatus 
      });
      setTask(updatedTask);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View>
        <Text>Task not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <Pressable 
                onPress={() => router.push(`/tasks/${task.id}/edit`)}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="pencil" size={24} color="#6366f1" />
              </Pressable>
              <Pressable onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </Pressable>
            </View>
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

        {task.breakdown && (
          <View>
            <Text>AI-Generated Breakdown:</Text>
            {task.breakdown.steps.map((step, index) => (
              <View key={index}>
                <Text>{step.description}</Text>
                <Text>Time Estimate: {step.time_estimate} minutes</Text>
                <Text>Initiation Tip: {step.initiation_tip}</Text>
                <Text>Completion Signal: {step.completion_signal}</Text>
                <Text>Focus Strategy: {step.focus_strategy}</Text>
                <Text>Dopamine Hook: {step.dopamine_hook}</Text>
              </View>
            ))}
            <Text>Suggested Breaks: {task.breakdown.suggested_breaks.join(', ')}</Text>
            <Text>Initiation Strategy: {task.breakdown.initiation_strategy}</Text>
            <Text>Energy Level Needed: {task.breakdown.energy_level_needed}</Text>
            <Text>Materials Needed: {task.breakdown.materials_needed.join(', ')}</Text>
            <Text>Environment Setup: {task.breakdown.environment_setup}</Text>
          </View>
        )}
      </View>
    </>
  );
}