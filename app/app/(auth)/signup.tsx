import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignupForm from '@/lib/components/auth/SignupForm';

export default function SignupScreen() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 justify-center px-4">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
          <Text className="mt-2 text-gray-600">Sign up to get started</Text>
        </View>
        
        <SignupForm />
        
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <Link href={{ pathname: "./login" }} className="text-indigo-600 font-semibold">
            Sign in
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}