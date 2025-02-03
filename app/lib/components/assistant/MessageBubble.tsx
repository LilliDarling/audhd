import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AssistantMessage, AssistantResponse } from '@/lib/api/assistant';
import TaskBreakdown from './TaskBreakdown';

interface MessageBubbleProps {
  message: AssistantMessage;
  suggestions?: AssistantResponse;
}

export default function MessageBubble({ message, suggestions }: MessageBubbleProps) {
  const isUser = message.type === 'user';

  const [isExpanded, setIsExpanded] = useState(false);

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
          <Pressable 
            onPress={() => setIsExpanded(!isExpanded)}
            style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}
          >
            <TaskBreakdown 
              breakdown={suggestions.task_breakdown} 
            />
          </Pressable>
        )}
        
        {!isUser && suggestions?.focus_tips && suggestions.focus_tips.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: '600', color: '#4B5563' }}>Focus Tips:</Text>
            {suggestions.focus_tips.map((tip, index) => (
              <Text key={index} style={{ color: '#374151' }}>• {tip}</Text>
            ))}
          </View>
        )}
        
        {!isUser && suggestions?.dopamine_boosters && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: '600', color: '#4B5563' }}>Quick Wins:</Text>
            {suggestions.dopamine_boosters.map((booster, index) => (
              <Text key={index} style={{ color: '#374151' }}>🎯 {booster}</Text>
            ))}
          </View>
        )}

        {!isUser && suggestions?.executive_function_supports && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: '600', color: '#4B5563' }}>Executive Function Support:</Text>
            {suggestions.executive_function_supports.map((support, index) => (
              <Text key={index} style={{ color: '#374151' }}>
                {support.category === 'task_initiation' ? '🚀' : '💡'} {support.strategy}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}