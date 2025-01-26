import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface TaskFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: {
    title: string;
    description: string;
    priority: number;
    status: string;
  };
}

export default function TaskForm({ onSubmit, initialData }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 1,
    status: initialData?.status || 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="space-y-4">
      {error && <Text className="text-red-500">{error}</Text>}

      <View>
        <Text className="text-gray-700 font-medium mb-1">Title</Text>
        <TextInput
          className="bg-white p-3 rounded-lg border border-gray-300"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="Task title"
        />
      </View>

      <View>
        <Text className="text-gray-700 font-medium mb-1">Description</Text>
        <TextInput
          className="bg-white p-3 rounded-lg border border-gray-300"
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Task description"
          multiline
          numberOfLines={3}
        />
      </View>

      <View>
        <Text className="text-gray-700 font-medium mb-1">Priority</Text>
        <View className="bg-white rounded-lg border border-gray-300">
          <Picker
            selectedValue={formData.priority}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <Picker.Item label="Low" value={1} />
            <Picker.Item label="Medium" value={2} />
            <Picker.Item label="High" value={3} />
          </Picker>
        </View>
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className={`bg-indigo-600 p-4 rounded-lg ${loading ? 'opacity-50' : ''}`}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Creating...' : 'Create Task'}
        </Text>
      </Pressable>
    </View>
  );
}