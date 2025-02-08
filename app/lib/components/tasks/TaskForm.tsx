import { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Task } from '@/lib/types/tasks';


interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id'>) => Promise<void>;
  initialData?: Task;
}

export default function TaskForm({ onSubmit, initialData }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 1,
    status: initialData?.status || 'pending',
    context: {
      time_of_day: initialData?.context?.time_of_day || 'any',
      energy_level: initialData?.context?.energy_level || 2,
      environment: initialData?.context?.environment || 'any',
      current_medications: initialData?.context?.current_medications || false,
    },
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
    <View>
      {error && (
        <View>
          <Text>{error}</Text>
        </View>
      )}

      <View>
        <Text>Title</Text>
        <TextInput
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="Task title"
        />
        <Text>
          {formData.title.length}/30 characters
        </Text>
      </View>

      <View>
        <Text>Description</Text>
        <TextInput
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
        <Text>Priority</Text>
        <View>
          <Picker
            selectedValue={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <Picker.Item label="Low" value={1} />
            <Picker.Item label="Medium" value={2} />
            <Picker.Item label="High" value={3} />
          </Picker>
        </View>
      </View>

      <View>
        <Text>Time of Day</Text>
        <Picker
          selectedValue={formData.context.time_of_day}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              context: { ...prev.context, time_of_day: value },
            }))
          }
        >
          <Picker.Item label="Any" value="any" />
          <Picker.Item label="Morning" value="morning" />
          <Picker.Item label="Afternoon" value="afternoon" />
          <Picker.Item label="Evening" value="evening" />
        </Picker>
      </View>

      <View>
        <Text>Energy Level</Text>
        <Picker
          selectedValue={formData.context.energy_level}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              context: { ...prev.context, energy_level: value },
            }))
          }
        >
          <Picker.Item label="Low" value={1} />
          <Picker.Item label="Medium" value={2} />
          <Picker.Item label="High" value={3} />
        </Picker>
      </View>

      <View>
        <Text>Environment</Text>
        <Picker
          selectedValue={formData.context.environment}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              context: { ...prev.context, environment: value },
            }))
          }
        >
          <Picker.Item label="Any" value="any" />
          <Picker.Item label="Home" value="home" />
          <Picker.Item label="Work" value="work" />
          <Picker.Item label="School" value="school" />
          <Picker.Item label="Outside" value="outside" />
        </Picker>
      </View>

      <View>
        <Text>Current Medications</Text>
        <Switch
          value={formData.context.current_medications}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              context: { ...prev.context, current_medications: value },
            }))
          }
        />
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text>
        {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Task' : 'Create Task')}
        </Text>
      </Pressable>
    </View>
  );
}