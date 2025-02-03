import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
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

  return (
    <View className="flex w-full items-center justify-center">
      {authError ? (
        <Text className="w-full py-2 text-red-200">{authError}</Text>
      ) : null}

      <View className='mb-6'>
        <TextInput
          className="px-6 py-2 border rounded"
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
          <Text className="w-full py-2 text-red-200">{formErrors.username}</Text>
        ) : null}
      </View>

      <View className='mb-6'>
        <TextInput
          className="px-6 py-2 border rounded"
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
          <Text className="w-full py-2 text-red-200">{formErrors.password}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="border rounded px-6 py-2 mt-6 bg-pop-primary hover:bg-pop-secondary/80">
            Sign In</Text>

        )}
      </Pressable>
    </View>
  );
}
