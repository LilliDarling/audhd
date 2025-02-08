import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    priority: number;
    status: string;
  };
}


export default function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handlePress = () => {
    router.push(`/tasks/${task.id}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <View>
        <View>
          <Text>{task.title}</Text>
          <Text>{formatStatus(task.status)}</Text>
          <Text>Priority: {task.priority}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </Pressable>
  );
}