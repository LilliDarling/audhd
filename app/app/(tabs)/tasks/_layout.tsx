import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GoogleAuthButton from '@/lib/components/calendar/GoogleAuthButton';

export default function TasksLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f8fafc',
        },
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              padding: 8,
            })}
          >
            <Ionicons name="chevron-back" size={24} color="#6366f1" />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Tasks',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <GoogleAuthButton />
              <Link href="/tasks/create" asChild>
                <Pressable
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                    padding: 8,
                    marginRight: 8,
                  })}
                >
                  <Ionicons name="add" size={28} color="#6366f1" />
                </Pressable>
              </Link>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="create" 
        options={{
          title: 'Create Task'
        }}
      />
      <Stack.Screen 
        name="[id]" 
        options={{
          title: 'Task Details',
          headerBackTitle: 'Tasks'
        }}
      />
      <Stack.Screen 
        name="[id]/edit" 
        options={{
          title: 'Edit Task',
          headerBackTitle: 'Details'
        }}
      />
    </Stack>
  );
}