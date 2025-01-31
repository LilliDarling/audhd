import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Pressable, 
  FlatList,
  KeyboardAvoidingView,
  Platform,
  type FlatList as FlatListType
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAssistant } from '@/lib/hooks/useAssistant';
import MessageBubble from '@/lib/components/assistant/MessageBubble';
import VoiceRecorder from '@/lib/components/assistant/VoiceRecorder';
import { AssistantMessage, TaskBreakdown } from '@/lib/api/assistant';
import axios from 'axios';

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
  const [message, setMessage] = useState('');
  const [lastResponse, setLastResponse] = useState<AssistantResponse | undefined>(undefined);
  const { messages, isLoading, sendMessage, sendVoiceMessage } = useAssistant();
  const flatListRef = useRef<FlatListType<AssistantMessage>>(null);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
  
    const currentMessage = message;
    setMessage('');
  
    try {
      const response = await axios.post<AssistantResponse>('/api/assistant/message', { message: currentMessage }, {
        withCredentials: true, // Ensure cookies are sent with the request
      });
      setLastResponse(response.data); // response.data is now typed as AssistantResponse
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to send message:', error.message);
        if (error.message === 'No JWT token found. Please log in.') {
          alert('Please log in to use the assistant.');
          // Optionally, redirect to the login page:
          // router.push('/login');
        }
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };

  const handleVoiceMessage = async (base64Audio: string) => {
    try {
      const response = await sendVoiceMessage(base64Audio);
      setLastResponse(response);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Failed to send voice message:', error);
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