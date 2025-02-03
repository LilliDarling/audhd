import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignupForm from '@/lib/components/auth/SignupForm';
import Line from '@/lib/components/ui/Line';

export default function SignupScreen() {
  return (
    <SafeAreaView className="flex h-full w-full bg-dull-primary">
      <View className="flex h-full w-full items-center justify-center">
        <Image
          source={require('@/assets/images/adeptexec-logo/wide.png')}
          className="w-1/2 h-12 m-2"
          contentFit="scale-down"
        />
        <Text className="m-2 text-lg">
          Welcome! Sign up to get started
        </Text>

        <SignupForm />
        <Line />
        <View className="mt-6 items-center">
          <Text className="mb-6">Already have an account? </Text>
          <Link href={{ pathname: "./login" }}>
          <Text className="w-36 px-6 py-2 border rounded bg-pop-primary hover:bg-pop-secondary/80">
              Sign In
            </Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}