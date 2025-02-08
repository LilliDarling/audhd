import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskBreakdown as TaskBreakdownType } from '@/lib/types/assistant';

interface TaskBreakdownProps {
  breakdown: TaskBreakdownType;
}

export default function TaskBreakdown({ breakdown }: TaskBreakdownProps) {
  return (
    <View>
      <View>
        <Text>📋 {breakdown.main_task}</Text>
        <View>
          <Text>⏱️ Estimated Time: {breakdown.estimated_time} minutes</Text>
          <Text>💪 Energy Level: {breakdown.energy_level_needed}/3</Text>
          <Text>🎯 Difficulty: {breakdown.difficulty_level}/3</Text>
        </View>
      </View>

      <View>
        <Text>Subtasks:</Text>
        {breakdown.subtasks.map((subtask, index) => (
          <View key={index}>
            <Text>{index + 1}. {subtask}</Text>
            {breakdown.break_points.includes(index) && (
              <Text>⏸️ Take a break here</Text>
            )}
          </View>
        ))}
      </View>

      {breakdown.initiation_tips.length > 0 && (
        <View>
          <Text>Getting Started Tips:</Text>
          {breakdown.initiation_tips.map((tip, index) => (
            <Text key={index}>• {tip}</Text>
          ))}
        </View>
      )}

      {breakdown.dopamine_hooks.length > 0 && (
        <View>
          <Text>Motivation Boosters:</Text>
          {breakdown.dopamine_hooks.map((hook, index) => (
            <Text key={index}>🎯 {hook}</Text>
          ))}
        </View>
      )}
    </View>
  );
}