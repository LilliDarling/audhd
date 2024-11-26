// src/components/TaskList.tsx
import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import { colors } from '../theme/colors';

interface TaskListProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
}

export const TaskList = ({
  tasks,
  onTaskPress,
  onToggleComplete,
  onRefresh,
  refreshing = false,
}: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tasks yet</Text>
        <Text style={styles.emptySubtext}>
          Tap the + button to create a new task
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      renderItem={({ item }) => (
        <TaskItem
          task={item}
          onPress={() => onTaskPress(item)}
          onToggleComplete={() => onToggleComplete(item.id, !item.completed)}
        />
      )}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.blue}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray600,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
});
