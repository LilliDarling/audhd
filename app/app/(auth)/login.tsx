import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import LoginForm from '@/lib/components/auth/LoginForm';

export default function LoginScreen() {
  return (
    <SafeAreaView>
      <View>
        <View>
          <Text>Welcome Back</Text>
          <Text>Sign in to continue</Text>
        </View>
        
        <LoginForm />
        
        <View>
          <Text>Don't have an account? </Text>
          <Link href={{ pathname: "./signup" }}>
            Sign up
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}