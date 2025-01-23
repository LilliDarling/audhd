import { Stack } from 'expo-router';
import { AuthProvider } from '@/lib/context/AuthContext';
import { PropsWithChildren } from 'react';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <Stack screenOptions={{
        headerShown: false,
      }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {children}
    </AuthProvider>
  );
}
