import { Stack } from 'expo-router';

export default function AssistantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f8fafc',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'ADHD Assistant',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}