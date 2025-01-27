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

const priorityColors = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-red-100 text-red-800',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

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
          <Text numberOfLines={2}>{task.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
      
      <View>
        <View>
          <Text>Priority {task.priority}</Text>
        </View>
        <View>
          <Text>{formatStatus(task.status)}</Text>
        </View>
      </View>
    </Pressable>
  );
}