import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View className="flex h-full w-full items-center justify-center">
      <Text className="m-2 text-2xl font-bold">
        Welcome to TaskMaster
      </Text>
      <Text className="m-2">
        Your personal task management assistant
      </Text>

      <Link href="./tasks" asChild>
        <Text className="m-2 text-lg text-pop-secondary">
          View My Tasks →
        </Text>
      </Link>
    </View>
  );
}