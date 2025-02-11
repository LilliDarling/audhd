import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTasks } from '@/lib/hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';
import { tasksApi } from '@/lib/api/tasks';
import { Task } from '@/lib/types/tasks'
import { Picker } from '@react-native-picker/picker';

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
            <View className="flex-row">
              <Pressable 
                onPress={() => router.push(`/tasks/${task.id}/edit`)}
                className="mr-4"
              >
                <Ionicons name="pencil" size={24} color="#e2e8f0" />
              </Pressable>
              <Pressable onPress={handleDelete} className="mr-4">
                <Ionicons name="trash-outline" size={24} color="red" />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-slate-800">
        <View className="p-4 space-y-6">
          <View className="space-y-2">
            <Text className="text-3xl font-bold text-slate-200">{task.title}</Text>
            <Text className="text-base text-slate-300">{task.description}</Text>
            <Text className="text-base text-slate-400">Priority: {task.priority}</Text>
          </View>

          <View className="space-y-4">
            <Text className="text-lg font-semibold text-slate-200">Update Status:</Text>
            <View className="bg-slate-700 py-1 w-1/3 border-0 rounded-lg overflow-hidden">
              <Picker
                selectedValue={task.status}
                onValueChange={handleUpdateStatus}
                dropdownIconColor="#9ca3af"
                className="text-slate-200 bg-slate-700"
              >
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="In Progress" value="in_progress" />
                <Picker.Item label="Completed" value="completed" />
              </Picker>
            </View>
          </View>

          {task.breakdown && (
            <View className="space-y-6">
              <Text className="text-xl font-bold text-slate-200">AI-Generated Breakdown</Text>
              
              <View className="space-y-4">
                {task.breakdown.steps.map((step, index) => (
                  <View key={index} className="p-4 bg-slate-700 rounded-lg space-y-2">
                    <Text className="text-lg font-semibold text-slate-200">
                      Step {index + 1}: {step.description}
                    </Text>
                    <Text className="text-slate-300">⏱️ Time Estimate: {step.time_estimate} minutes</Text>
                    <Text className="text-slate-300">🚀 Get Started: {step.initiation_tip}</Text>
                    <Text className="text-slate-300">✅ Complete When: {step.completion_signal}</Text>
                    <Text className="text-slate-300">🎯 Focus Strategy: {step.focus_strategy}</Text>
                    <Text className="text-slate-300">🎉 Reward: {step.dopamine_hook}</Text>
                  </View>
                ))}
              </View>

              <View className="space-y-4">
                <Text className="text-2xl font-semibold text-slate-200">Task Strategy</Text>
                <Text className="text-base text-slate-300">⏸️ Take Breaks After Steps: {task.breakdown.suggested_breaks.join(', ')}</Text>
                <Text className="text-base text-slate-300">🎬 Getting Started: {task.breakdown.initiation_strategy}</Text>
                <Text className="text-base text-slate-300">⚡ Energy Level Required: {task.breakdown.energy_level_needed}/3</Text>
                <View className="space-y-2">
                  <Text className="text-base font-semibold text-slate-200">🛠️ Materials Needed:</Text>
                  {task.breakdown.materials_needed.map((item, index) => (
                    <Text key={index} className="text-base text-slate-300">• {item}</Text>
                  ))}
                </View>
                
                <View className="space-y-2">
                  <Text className="text-base font-semibold text-slate-200">🏡 Environment Setup:</Text>
                  <Text className="text-base text-slate-300 pb-5">{task.breakdown.environment_setup}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}