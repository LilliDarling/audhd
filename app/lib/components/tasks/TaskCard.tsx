import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
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
  return (
    <Link href={`/tasks/${task.id}`} asChild>
      <Pressable>
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
            <Text>{task.status.replace('_', ' ')}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}