import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from 'expo-router';
import TaskCard from '@/lib/components/tasks/TaskCard';
import { useTasks } from '@/lib/hooks/useTasks';

export default function TasksScreen() {
  const { tasks, isLoading, error, refreshTasks } = useTasks();
  const navigation = useNavigation();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshTasks();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View>
      {isLoading ? (
        <View>
          <Text style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>Loading tasks...</Text>
        </View>
      ) : error ? (
        <View>
          <Text style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{error}</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View>
          <Text style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            No tasks yet. Tap the + button to create one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={({ item }) => <TaskCard task={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }}/>}
        />
      )}
    </View>
  );
}