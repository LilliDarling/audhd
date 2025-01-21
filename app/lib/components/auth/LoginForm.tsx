import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/context/AuthContext';

interface FormErrors {
  username?: string;
  password?: string;
}

export default function LoginForm() {
  const { signIn, isLoading, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 5) {
      errors.username = 'Username must be at least 5 characters';
    }

    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await signIn({ username, password });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const getFieldErrorStyle = (field?: string) => 
    field ? 'border-red-500' : 'border-gray-300';

  return (
    <View className="space-y-4">
      {authError ? (
        <Text className="text-red-500 text-sm">{authError}</Text>
      ) : null}
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
        <TextInput
          className={`w-full px-4 py-3 bg-white border rounded-lg ${getFieldErrorStyle(formErrors.username)}`}
          placeholder="Enter your username"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setFormErrors(prev => ({ ...prev, username: undefined }));
          }}
          autoCapitalize="none"
          autoComplete="username"
          textContentType="username"
        />
        {formErrors.username ? (
          <Text className="text-red-500 text-sm mt-1">{formErrors.username}</Text>
        ) : null}
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
        <TextInput
          className={`w-full px-4 py-3 bg-white border rounded-lg ${getFieldErrorStyle(formErrors.password)}`}
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setFormErrors(prev => ({ ...prev, password: undefined }));
          }}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
        />
        {formErrors.password ? (
          <Text className="text-red-500 text-sm mt-1">{formErrors.password}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        className={`w-full py-3 rounded-lg bg-indigo-600 
          ${isLoading ? 'opacity-50' : 'opacity-100'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold">Sign In</Text>
        )}
      </Pressable>
    </View>
  );
}
