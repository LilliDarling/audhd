// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, LogOut } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { TaskList } from '../components/TaskList';
import { TaskForm } from '../components/TaskForm';
import { TaskService } from '../services/taskService';
import { Task, TaskInput } from '../types/task';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';

export const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async () => {
    if (!user) {
      console.log('No user found, skipping task load');
      return;
    }

    console.log('Loading tasks for user:', user.uid);
    setLoading(true);

    try {
      const loadedTasks = await TaskService.getTasks(user.uid);
      console.log('Tasks loaded:', {
        count: loadedTasks.length,
        tasks: loadedTasks
      });

      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadTasks();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleCreateTask = async (taskData: TaskInput) => {
    if (!user) return;
    try {
      const newTask = await TaskService.addTask(user.uid, taskData);
      setTasks(prevTasks => [newTask, ...prevTasks]);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      await TaskService.updateTask(taskId, taskData);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...taskData } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await TaskService.toggleTaskCompletion(taskId, completed);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                completed,
                completedAt: completed ? new Date() : undefined,
              }
            : task
        )
      );
    } catch (error) {
      console.error('Error toggling task completion:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.blue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Tasks"
        subtitle={user?.email || ''}
        rightIcon={
          <TouchableOpacity onPress={handleSignOut}>
            <LogOut color={colors.neutral.gray600} size={24} />
          </TouchableOpacity>
        }
      />

      <TaskList
        tasks={tasks}
        onTaskPress={(task) => {
          setEditingTask(task);
          setShowTaskForm(true);
        }}
        onToggleComplete={handleToggleComplete}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingTask(null);
          setShowTaskForm(true);
        }}
      >
        <Plus color={colors.neutral.white} size={24} />
      </TouchableOpacity>

      <TaskForm
        visible={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={async (taskData) => {
          if (editingTask) {
            await handleUpdateTask(editingTask.id, taskData);
          } else {
            await handleCreateTask(taskData);
          }
        }}
        initialValues={editingTask || undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
