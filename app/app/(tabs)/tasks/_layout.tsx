import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TasksLayout() {
  const router = useRouter();

  const BackButton = () => (
    <Pressable
      onPress={() => router.back()}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      className="p-2 active:opacity-50"
    >
      <Ionicons name="chevron-back" size={24} color="#6366f1" />
    </Pressable>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#475569',
        },
        headerTitleStyle: {
          color: '#e2e8f0',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Tasks',
          headerLeft: () => null,
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <Link href="/tasks/create" asChild>
                <Pressable
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="p-2 mr-2 active:opacity-50"
                >
                  <Ionicons name="add" size={28} color="#e2e8f0" />
                </Pressable>
              </Link>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="create" 
        options={{
          title: 'Create Task',
          headerLeft: () => <BackButton />
        }}
      />
      <Stack.Screen 
        name="[id]" 
        options={{
          title: 'Task Details',
          headerLeft: () => <BackButton />,
          headerBackTitle: 'Tasks'
        }}
      />
      <Stack.Screen 
        name="[id]/edit" 
        options={{
          title: 'Edit Task',
          headerLeft: () => <BackButton />,
          headerBackTitle: 'Details'
        }}
      />
    </Stack>
  );
}