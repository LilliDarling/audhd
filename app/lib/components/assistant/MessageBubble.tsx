import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { AssistantMessage, AssistantResponse } from '@/lib/api/assistant';
import TaskBreakdown from './TaskBreakdown';

interface MessageBubbleProps {
  message: AssistantMessage;
  suggestions?: AssistantResponse;
  isLoading?: boolean;
}

export default function MessageBubble({ message, suggestions, isLoading }: MessageBubbleProps) {
  const isUser = message.type === 'user';

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  if (!isUser && isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.bubble, styles.assistantBubble]}>
          <ActivityIndicator size="small" color="#6366f1" />
        </View>
      </View>
    );
  }

  const renderSuggestionSection = (
    title: string,
    items: any[],
    icon?: string,
    getItemText?: (item: any) => string
  ) => {
    if (!items?.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((item, index) => (
          <Text key={index} style={styles.sectionItem}>
            {icon} {getItemText ? getItemText(item) : item}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userText : styles.assistantText
        ]}>
          {message.content}
        </Text>

        {!isUser && suggestions?.task_breakdown && (
          <Pressable 
            onPress={toggleExpand}
            style={styles.breakdownContainer}
          >
            <TaskBreakdown 
              breakdown={suggestions.task_breakdown}
            />
          </Pressable>
        )}
        
        {!isUser && suggestions && (
          <>
            {renderSuggestionSection(
              'Focus Tips:',
              suggestions.focus_tips || [],
              '•'
            )}
            
            {renderSuggestionSection(
              'Quick Wins:',
              suggestions.dopamine_boosters || [],
              '🎯'
            )}
            
            {renderSuggestionSection(
              'Executive Function Support:',
              suggestions.executive_function_supports || [],
              '',
              (support) => `${support.category === 'task_initiation' ? '🚀' : '💡'} ${support.strategy}`
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#6366f1',
  },
  assistantBubble: {
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  assistantText: {
    color: '#111827',
  },
  breakdownContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#4B5563',
    fontSize: 15,
    marginBottom: 4,
  },
  sectionItem: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
  }
});
