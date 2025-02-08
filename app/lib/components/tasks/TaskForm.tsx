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

  const validateForm = () => {
    if (formData.title.length < 5 || formData.title.length > 30) {
      setError('Title must be between 5 and 30 characters');
      return false;
    }
    if (formData.description.length < 5 || formData.description.length > 100) {
      setError('Description must be between 5 and 100 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
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
    <View className="flex h-full w-full items-center justify-center">
      {error && (
        <View>
          <Text>{error}</Text>
        </View>
      )}

      <View>
        <Text className="mt-6 font-bold">Title</Text>
        <TextInput
          className="px-6 py-2 border rounded"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="Task title"
        />
        <Text>
          {formData.title.length}/30 characters
        </Text>
      </View>

      <View>
        <Text className="mt-6 font-bold">Description</Text>
        <TextInput
          className="px-6 py-2 border rounded"
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Task description"
          multiline
          numberOfLines={3}
        />
        <Text>
          {formData.description.length}/100 characters
        </Text>
      </View>

      <View>
        <Text className="mt-6 font-bold">Priority</Text>
        <View className='w-full'>
          <Picker
            className="px-6 py-2 border rounded"
            selectedValue={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
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
      >
        <Text className="border rounded px-6 py-2 mt-6 bg-pop-primary hover:bg-pop-secondary/80">
          {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Task' : 'Create Task')}
        </Text>
      </Pressable>
    </View>
  );
}