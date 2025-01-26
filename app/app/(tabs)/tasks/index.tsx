import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from '@/lib/components/tasks/TaskCard';
import { useTasks } from '@/lib/hooks/useTasks';

export default function TasksScreen() {
  const { tasks, isLoading, error } = useTasks();

  return (
    <>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <Link href="/tasks/create" asChild>
              <Pressable className="mr-4">
                <Ionicons name="add" size={24} color="#6366f1" />
              </Pressable>
            </Link>
          ),
        }} 
      />
      
      <View className="flex-1 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <Text>Loading tasks...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500">{error}</Text>
          </View>
        ) : tasks.length === 0 ? (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-500 text-center">
              No tasks yet. Tap the + button to create one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            renderItem={({ item }) => <TaskCard task={item} />}
            keyExtractor={item => item.id}
            contentContainerClassName="p-4"
            ItemSeparatorComponent={() => <View className="h-2" />}
          />
        )}
      </View>
    </>
  );
}