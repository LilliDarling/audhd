import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { authApi } from '@/lib/api/auth';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      await authApi.signIn({ username, password });
      router.replace("./../(tabs)");
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="space-y-4">
      {error ? (
        <Text className="text-red-500 text-sm">{error}</Text>
      ) : null}
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
        <TextInput
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg"
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
        <TextInput
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        className={`w-full py-3 rounded-lg bg-indigo-600 
          ${loading ? 'opacity-50' : 'opacity-100'}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold">Sign In</Text>
        )}
      </Pressable>
    </View>
  );
}
