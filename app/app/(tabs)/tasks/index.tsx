import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from 'expo-router';
import { useTasks } from '@/lib/hooks/useTasks';
import TaskCard from '@/lib/components/tasks/TaskCard';
import { Task } from '@/lib/types/tasks';

export default function TasksScreen() {
  const { tasks, isLoading, error, refreshTasks } = useTasks();
  const navigation = useNavigation();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshTasks();
    });

    return unsubscribe;
  }, [navigation]);

  const chunkTasks = (tasks: Task[], size: number = 3): Task[][] => {
    return Array.from(
      { length: Math.ceil(tasks.length / size) },
      (_, index) => tasks.slice(index * size, index * size + size)
    );
  };

  const taskRows = chunkTasks(tasks);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-800 p-4 justify-center items-center">
        <Text className="text-slate-200">Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-slate-800 p-4 justify-center items-center">
        <Text className="text-red-400">{error}</Text>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View className="flex-1 bg-slate-800 p-4 justify-center items-center">
        <Text className="text-slate-200">
          No tasks yet. Tap the + button to create one.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-800">
      <FlatList<Task[]>
        data={taskRows}
        renderItem={({ item: rowTasks }) => (
          <View className="flex-row p-2">
            {rowTasks.map((task: Task) => (
              <View key={task.id} className="flex-1 px-2">
                <TaskCard task={task} />
              </View>
            ))}
            {rowTasks.length < 3 && 
              Array.from({ length: 3 - rowTasks.length }).map((_, index) => (
                <View key={`empty-${index}`} className="flex-1 px-2" />
              ))
            }
          </View>
        )}
        keyExtractor={(_, index) => `row-${index}`}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}