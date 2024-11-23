// src/components/TaskItem.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Task } from '../types/task';
import { colors } from '../theme/colors';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

export const TaskItem = ({ task, onPress, onToggleComplete }: TaskItemProps) => {
  const isOverdue = task.dueDate && new Date() > new Date(task.dueDate) && !task.completed;

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return colors.primary.red;
      case 'medium': return colors.primary.orange;
      case 'low': return colors.primary.green;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: getPriorityColor() }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              task.completed && styles.completedText
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: colors.primary.blue }
          ]}>
            <Text style={styles.categoryText}>
              {task.category}
            </Text>
          </View>
        </View>

        {task.description ? (
          <Text
            style={[
              styles.description,
              task.completed && styles.completedText
            ]}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.dates}>
            {task.dueDate && (
              <Text
                style={[
                  styles.dateText,
                  isOverdue && styles.overdueText
                ]}
              >
                Due: {formatDate(task.dueDate)}
                {isOverdue && ' (Overdue)'}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.completeButton,
              task.completed && styles.uncompleteButton
            ]}
            onPress={onToggleComplete}
          >
            <Text style={styles.completeButtonText}>
              {task.completed ? 'Undo' : 'Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.neutral.gray400,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: colors.neutral.white,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dates: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: colors.neutral.gray500,
  },
  overdueText: {
    color: colors.primary.red,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: colors.primary.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  uncompleteButton: {
    backgroundColor: colors.neutral.gray400,
  },
  completeButtonText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '500',
  },
});
