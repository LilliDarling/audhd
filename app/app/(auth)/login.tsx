import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import LoginForm from '@/lib/components/auth/LoginForm';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 justify-center px-4">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
          <Text className="mt-2 text-gray-600">Sign in to continue</Text>
        </View>
        
        <LoginForm />
        
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <Link href={{ pathname: "./register" }} className="text-indigo-600 font-semibold">
            Sign up
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}