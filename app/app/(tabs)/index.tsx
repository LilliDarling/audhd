import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#fff'
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1f2937'
      }}>
        Welcome to TaskMaster
      </Text>
      
      <Text style={{
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24
      }}>
        Your personal task management assistant
      </Text>

      <Link href="./tasks" asChild>
        <Text style={{
          color: '#6366f1',
          fontSize: 16,
          fontWeight: '500'
        }}>
          View My Tasks →
        </Text>
      </Link>
    </View>
  );
}