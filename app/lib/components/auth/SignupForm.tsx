import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/context/AuthContext';

interface FormErrors {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
}

export default function SignupForm() {
  const { signUp, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,72}$/;

    if (!formData.username.trim() || formData.username.length < 5) {
      errors.username = 'Username must be at least 5 characters';
    }

    if (!formData.name.trim() || formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!passwordRegex.test(formData.password)) {
      errors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await signUp(formData);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const renderField = (field: keyof typeof formData, label: string, options: any = {}) => (
    <View className="flex w-full items-center justify-center">


      <TextInput
        className="mt-6 px-6 py-2 border rounded"
        value={formData[field]}
        onChangeText={(value) => updateField(field, value)}
        {...options}
      />
      {formErrors[field] && (
        <Text className="w-1/2 py-2 text-red-200">{formErrors[field]}</Text>
      )}
    </View>
  );

  return (
    <View className="flex w-full items-center justify-center">

      {authError && (
        <Text className="w-full py-2 text-red-200">{authError}</Text>
      )}

      {renderField('username', 'Username', {
        placeholder: 'Enter your username',
        autoCapitalize: 'none',
      })}

      {renderField('name', 'Name', {
        placeholder: 'Enter your full name',
      })}

      {renderField('email', 'Email', {
        placeholder: 'Enter your email',
        autoCapitalize: 'none',
        keyboardType: 'email-address',
      })}

      {renderField('password', 'Password', {
        placeholder: 'Create a password',
        secureTextEntry: true,
      })}

      <Pressable
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="border rounded px-6 py-2 mt-6 bg-pop-primary hover:bg-pop-secondary/80">
            Create Account</Text>
        )}
      </Pressable>
    </View>
  );
}