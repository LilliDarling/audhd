import { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Task } from '@/lib/types/tasks';
import { tasksApi } from '@/lib/api/tasks';


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
  const [breakdown, setBreakdown] = useState<any>(null);

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

  const handleGenerate = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      setError('');

      const cleanData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        context: formData.context
      };

      const response = await tasksApi.generateBreakdown(cleanData);
      setBreakdown(response.breakdown);
    } catch (err: any) {
      setError(err.message || 'Failed to generate breakdown');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !breakdown) return;
    try {
      setLoading(true);
      setError('');

      const taskData = {
        ...formData,
        breakdown
      };

      await onSubmit(taskData);
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="p-4 gap-4 justify-center items-center bg-dull-primary">
        {error && (
          <View>
            <Text>{error}</Text>
          </View>
        )}

        <View className="w-full mb-6">
          <Text className="font-bold text-gray-800 mb-2">Title</Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Task title"
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
          />
          <Text>
            {formData.title.length}/30 characters
          </Text>
        </View>

        <View className="w-full mb-6">
          <Text className="font-bold text-gray-800 mb-2">Description</Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Task description"
            multiline
            numberOfLines={3}
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"

          />
          <Text>
            {formData.description.length}/100 characters
          </Text>
        </View>

        <View className="w-full mb-6">
          <Text className="font-bold text-gray-800 mb-2">Priority</Text>
          <View>
            <Picker
              className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
              selectedValue={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <Picker.Item label="Low" value={1} />
              <Picker.Item label="Medium" value={2} />
              <Picker.Item label="High" value={3} />
            </Picker>
          </View>
        </View>

        <View className="w-full mb-6">
          <Text className="font-bold text-gray-800 mb-2">Time of Day</Text>
          <Picker
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
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

        <View className="w-full mb-6">
          <Text className="font-bold text-gray-800 mb-2">Energy Level</Text>
          <Picker
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
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

        <View className="w-full mb-6">
          <Text className="font-bold text-gray-800 mb-2">Environment</Text>
          <Picker
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
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

        <View className="w-full mb-6">
          <Text className="font-bold text-gray-800 mb-2">Current Medications</Text>
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
          onPress={handleGenerate}
          disabled={loading}
          className="border rounded px-6 py-2 mt-6 bg-pop-primary hover:bg-pop-secondary/80"
        >
          <Text>
            {loading ? 'Generating...' : 'Generate Breakdown'}
          </Text>
        </Pressable>


        <View className="w-full mb-6">
          {breakdown && (
            <View className="flex h-full w-full justify-center items-center ">
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Generated Breakdown:</Text>
              <View className="w-full mb-6">
                <Text className="font-bold text-gray-800 mb-2">Steps:</Text>
                {breakdown.steps.map((step: any, index: number) => (
                  <View key={index} style={{ gap: 4 }}>
                    <Text style={{ fontWeight: 'bold' }}>Step {index + 1}: {step.description}</Text>
                    <Text>Time: {step.time_estimate} minutes</Text>
                    <Text>Get Started: {step.initiation_tip}</Text>
                    <Text>Complete When: {step.completion_signal}</Text>
                    <Text>Reward: {step.dopamine_hook}</Text>
                  </View>
                ))}
              </View>

              <View className="w-full mb-6">
                <Text className="font-bold text-gray-800 mb-2">Task Strategy:</Text>
                <Text>Take Breaks After Steps: {breakdown.suggested_breaks.join(', ')}</Text>
                <Text>Getting Started: {breakdown.initiation_strategy}</Text>
                <Text>Energy Level Required: {breakdown.energy_level_needed}/3</Text>

                <Text style={{ fontWeight: 'bold' }}>Materials Needed:</Text>
                {breakdown.materials_needed.map((item: string, index: number) => (
                  <Text key={index}>• {item}</Text>
                ))}

                <Text style={{ fontWeight: 'bold' }}>Environment Setup:</Text>
                <Text>{breakdown.environment_setup}</Text>
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className="bg-green-700 w-full max-w-[300px] py-3 rounded-lg active:bg-blue-700"
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {loading ? 'Creating...' : 'Create Task'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

    </SafeAreaView>
  );
}