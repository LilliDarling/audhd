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
    <Pressable onPress={handlePress} className="active:opacity-80">
      <View className="px-2 rounded-lg border max-h-32 min-h-32 w-full">
        <View className="flex-1 py-2">
          <Text numberOfLines={1} ellipsizeMode="tail" className="text-lg font-bold text-slate-200">{task.title}</Text>
          <Text className="text-sm text-slate-400">{formatStatus(task.status)}</Text>
          <Text className="text-sm text-slate-400">Priority: {task.priority}</Text>
        </View>
        <View className="items-center py-2">
          <Ionicons name="information-circle-outline" size={25} color="#9ca3af" />
        </View>
      </View>
    </Pressable>
  );
}