import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginForm from '@/lib/components/auth/LoginForm';
import Line from '@/lib/components/ui/Line';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex h-full w-full bg-dull-primary">
      <View className="h-full w-full items-center justify-center">
        <Image
          source={require('@/assets/images/adeptexec-logo/wide.png')}
          className="w-1/2 h-20 m-6"
          contentFit="scale-down"
        />
        <Text className="m-4 text-xl">
          Welcome Back! Sign in to continue
        </Text>

        <LoginForm />
        
        <Line />

        <View className="items-center">
          <Text className="mb-6 text-lg">Don't have an account?</Text>
          <Link href={{ pathname: './signup' }}>
            <Text className="px-6 py-2 border rounded bg-pop-primary hover:bg-pop-secondary/80">
              Sign Up
            </Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
