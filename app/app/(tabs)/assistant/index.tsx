import axios from 'axios';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  type FlatList as FlatListType,
  Alert
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import MessageBubble from '@/lib/components/assistant/MessageBubble';
import VoiceRecorder from '@/lib/components/assistant/VoiceRecorder';
import { useAssistant } from '@/lib/hooks/useAssistant';
import { AssistantMessage, TaskBreakdown } from '@/lib/api/assistant';
import { useAuth } from '@/lib/context/AuthContext';
import { BASE_URL } from '@/constants/api';

interface AssistantResponse {
  content: string;
  task_breakdown?: TaskBreakdown;
  suggested_tasks?: string[];
  calendar_suggestions?: any[];
  dopamine_boosters?: string[];
  focus_tips?: string[];
  executive_function_supports?: any[];
  environment_adjustments?: string[];
}

export default function AssistantScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [message, setMessage] = useState('');
  const [lastResponse, setLastResponse] = useState<AssistantResponse | undefined>();
  const { messages, isLoading, error, sendMessage, sendVoiceMessage } = useAssistant();
  const flatListRef = useRef<FlatListType<AssistantMessage>>(null);

  if (authLoading) {
    return (
      <View className="flex h-full w-full items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex h-full w-full items-center justify-center">
        <Text>Please log in to use the assistant</Text>
      </View>
    );
  }

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const currentMessage = message;
    setMessage('');

    try {
      console.log('Starting message send...');
      const response = await axios.post(
        `${BASE_URL}/api/assistant/message`,  // Use full URL
        { message: currentMessage },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      console.log('Raw response:', response);
      console.log('Response data:', response.data);

      if (!response.data || !response.data.content) {
        throw new Error('Invalid response format from server');
      }

      setLastResponse(response.data);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Complete error object:', error);
      if (axios.isAxiosError(error)) {
        console.error('Request config:', error.config);
        console.error('Response:', error.response);
      }
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleVoiceMessage = async (base64Audio: string) => {
    try {
      const response = await sendVoiceMessage(base64Audio);
      setLastResponse(response);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Failed to send voice message:', error);
      Alert.alert('Error', 'Failed to process voice message');
    }
  };

  const renderMessage = ({ item, index }: { item: AssistantMessage; index: number }) => (
    <MessageBubble
      message={item}
      suggestions={item.type === 'assistant' && index === messages.length - 1 ? lastResponse : undefined}
    />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ title: 'ADHD Assistant' }} />

      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.timestamp + index}
          contentContainerStyle={{ padding: 10 }}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={{
          flexDirection: 'row',
          padding: 10,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: 'white',
          alignItems: 'flex-end'
        }}>
          <VoiceRecorder onRecordingComplete={handleVoiceMessage} />

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            multiline
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: '#f3f4f6',
              borderRadius: 20,
              marginHorizontal: 10,
              maxHeight: 100
            }}
          />

          <Pressable
            onPress={handleSend}
            disabled={isLoading || !message.trim()}
          >
            <Ionicons
              name="send"
              size={24}
              color={isLoading || !message.trim() ? '#9ca3af' : '#6366f1'}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}