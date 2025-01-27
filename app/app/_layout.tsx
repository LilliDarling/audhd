import { Stack } from 'expo-router';
import { AuthProvider } from '@/lib/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{
        headerShown: false,
      }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tasks" />
      </Stack>
    </AuthProvider>
  );
}
