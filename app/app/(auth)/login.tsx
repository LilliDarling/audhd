import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import LoginForm from '@/lib/components/auth/LoginForm';

export default function LoginScreen() {
  return (
    <SafeAreaView className='h-full w-full bg-slate-900'>
      <View className="flex-2 items-center justify-center p-4 m-12">
        <Image source={require('../../assets/images/logo-wide.png')} style={{ width: 500, height: 120 }} resizeMode="contain" className='m-12 border-8 rounded-lg border-yellow-500'/>
        <Text className="text-2xl text-yellow-500 font-bold mb-4">Welcome Back! Sign in to continue</Text>
        <LoginForm />

        <View className="w-1/2 items-center justify-center m-12 pt-6 border-t-2 border-slate-400">
          <Text className="text-2xl text-yellow-500 font-bold m-4">Don't have an account? </Text>
          <Link href={{ pathname: "./signup" }}>
            <Text className="text-lg text-white hover:text-slate-600 border-2 bg-rose-500 rounded-lg m-4 px-6 py-2">Sign Up </Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}