import { Stack } from 'expo-router';

export default function TastsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f9fafb' },
      }}
    >
      <Stack.Screen name="create" />
    </Stack>
  );
}