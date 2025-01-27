import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignupForm from '@/lib/components/auth/SignupForm';

export default function SignupScreen() {
  return (
    <SafeAreaView>
      <View>
        <View>
          <Text>Create Account</Text>
          <Text>Sign up to get started</Text>
        </View>
        
        <SignupForm />
        
        <View>
          <Text>Already have an account? </Text>
          <Link href={{ pathname: "./login" }}>
            Sign in
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}