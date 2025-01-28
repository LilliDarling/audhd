import React from 'react';
import { View, Text } from 'react-native';
import { AssistantMessage, AssistantResponse } from '@/lib/api/assistant';
import TaskBreakdown from './TaskBreakdown';

interface MessageBubbleProps {
  message: AssistantMessage;
  suggestions?: AssistantResponse;
}

export default function MessageBubble({ message, suggestions }: MessageBubbleProps) {
  const isUser = message.type === 'user';

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginVertical: 4,
    }}>
      <View style={{
        maxWidth: '80%',
        backgroundColor: isUser ? '#6366f1' : '#f3f4f6',
        borderRadius: 16,
        padding: 12,
      }}>
        <Text style={{
          color: isUser ? 'white' : '#111827',
        }}>
          {message.content}
        </Text>

        {!isUser && suggestions?.task_breakdown && (
          <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
            <TaskBreakdown breakdown={suggestions.task_breakdown} />
          </View>
        )}
        
        {!isUser && suggestions?.focus_tips && suggestions.focus_tips.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: '600' }}>Focus Tips:</Text>
            {suggestions.focus_tips.map((tip, index) => (
              <Text key={index}>• {tip}</Text>
            ))}
          </View>
        )}
        
        {!isUser && suggestions?.dopamine_boosters && suggestions.dopamine_boosters.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: '600' }}>Quick Wins:</Text>
            {suggestions.dopamine_boosters.map((booster, index) => (
              <Text key={index}>🎯 {booster}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}