import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, ScrollView } from 'react-native';
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
  const [usageInfo, setUsageInfo] = useState<any>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
        const usage = await tasksApi.getGenerationUsage();
        setUsageInfo(usage);
    } catch (err) {
        console.error('Failed to load usage info:', err);
    }
  };

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
    <View className="flex-1 bg-slate-800">
      <ScrollView className="flex-1">
        <View className="p-4 space-y-6">
          {error ? (
            <View className="bg-red-500/10 p-3 rounded-lg">
              <Text className="text-red-400">{error}</Text>
            </View>
          ) : null}

          <View className="space-y-3">
            <Text className="text-base text-slate-200 font-medium">Title</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Task title"
              className="bg-slate-700 text-slate-200 p-2 rounded-lg"
              placeholderTextColor="#94a3b8"
            />
            <Text className="text-slate-400 text-sm">
              {formData.title.length}/30 characters
            </Text>
          </View>

          <View className="space-y-2">
            <Text className="text-base text-slate-200 font-medium">Description</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Task description"
              multiline
              numberOfLines={3}
              className="bg-slate-700 text-slate-200 p-2 rounded-lg min-h-[100px]"
              placeholderTextColor="#94a3b8"
            />
            <Text className="text-slate-400 text-sm">
              {formData.description.length}/100 characters
            </Text>
          </View>

          <View className="space-y-2">
            <Text className="text-base text-slate-200 font-medium">Priority</Text>
            <View className="bg-slate-700 rounded-lg overflow-hidden">
              <Picker
                selectedValue={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                dropdownIconColor="#9ca3af"
                className="text-slate-200 bg-slate-700 p-2"
              >
                <Picker.Item label="Low" value={1} />
                <Picker.Item label="Medium" value={2} />
                <Picker.Item label="High" value={3} />
              </Picker>
            </View>
          </View>

          <View className="space-y-2">
            <Text className="text-base text-slate-200 font-medium">Time of Day</Text>
            <View className="bg-slate-700 rounded-lg overflow-hidden">
              <Picker
                selectedValue={formData.context.time_of_day}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    context: { ...prev.context, time_of_day: value },
                  }))
                }
                dropdownIconColor="#9ca3af"
                className="text-slate-200 bg-slate-700 p-2"
              >
                <Picker.Item label="Any" value="any" />
                <Picker.Item label="Morning" value="morning" />
                <Picker.Item label="Afternoon" value="afternoon" />
                <Picker.Item label="Evening" value="evening" />
              </Picker>
            </View>
          </View>

          <View className="space-y-2">
            <Text className="text-base text-slate-200 font-medium">Energy Level</Text>
            <View className="bg-slate-700 rounded-lg overflow-hidden">
              <Picker
                selectedValue={formData.context.energy_level}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    context: { ...prev.context, energy_level: value },
                  }))
                }
                dropdownIconColor="#9ca3af"
                className="text-slate-200 bg-slate-700 p-2"
              >
                <Picker.Item label="Low" value={1} />
                <Picker.Item label="Medium" value={2} />
                <Picker.Item label="High" value={3} />
              </Picker>
            </View>
          </View>

          <View className="space-y-2">
            <Text className="text-base text-slate-200 font-medium">Environment</Text>
            <View className="bg-slate-700 rounded-lg overflow-hidden">
              <Picker
                selectedValue={formData.context.environment}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    context: { ...prev.context, environment: value },
                  }))
                }
                dropdownIconColor="#9ca3af"
                className="text-slate-200 bg-slate-700 p-2"
              >
                <Picker.Item label="Any" value="any" />
                <Picker.Item label="Home" value="home" />
                <Picker.Item label="Work" value="work" />
                <Picker.Item label="School" value="school" />
                <Picker.Item label="Outside" value="outside" />
              </Picker>
            </View>
          </View>

          <View className="flex-row">
            <Text className="text-slate-200 font-medium text-base">Current Medications</Text>
            <View className="px-2 py-1">
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
          </View>

          {usageInfo && (
            <Text className="text-slate-400 text-sm">
              {usageInfo.generations_remaining} generations remaining today
            </Text>
          )}

          <View className="flex items-center">
            <Pressable
              onPress={handleGenerate}
              disabled={loading}
              className="bg-sky-600 py-2 px-2 rounded-lg active:opacity-80 w-1/3"
            >
              <Text className="text-slate-200 font-semibold text-center py-1">
                {loading ? 'Generating...' : 'Generate Breakdown'}
              </Text>
            </Pressable>
          </View>

          {breakdown && (
            <View className="space-y-6">
              <Text className="text-xl font-bold text-slate-200">Generated Breakdown:</Text>
              
              <View className="space-y-4">
                <Text className="text-lg font-semibold text-slate-200">Steps:</Text>
                {breakdown.steps.map((step: any, index: number) => (
                  <View key={index} className="bg-slate-700 p-4 rounded-lg space-y-2">
                    <Text className="font-semibold text-slate-200">Step {index + 1}: {step.description}</Text>
                    <Text className="text-slate-300">⏱️ Time: {step.time_estimate} minutes</Text>
                    <Text className="text-slate-300">🚀 Get Started: {step.initiation_tip}</Text>
                    <Text className="text-slate-300">✅ Complete When: {step.completion_signal}</Text>
                    <Text className="text-slate-300">🎉 Reward: {step.dopamine_hook}</Text>
                  </View>
                ))}
              </View>

              <View className="space-y-4">
                <Text className="text-lg font-semibold text-slate-200">Task Strategy:</Text>
                <Text className="text-base text-slate-300">⏸️ Take Breaks After Steps: {breakdown.suggested_breaks.join(', ')}</Text>
                <Text className="text-base text-slate-300">🎬 Getting Started: {breakdown.initiation_strategy}</Text>
                <Text className="text-base text-slate-300">⚡ Energy Level Required: {breakdown.energy_level_needed}/3</Text>
                
                <View className="space-y-2">
                  <Text className="text-base font-semibold text-slate-200">🛠️ Materials Needed:</Text>
                  {breakdown.materials_needed.map((item: string, index: number) => (
                    <Text key={index} className="text-base text-slate-300">• {item}</Text>
                  ))}
                </View>
                
                <View className="space-y-2">
                  <Text className="text-base font-semibold text-slate-200">🏡 Environment Setup:</Text>
                  <Text className="text-base text-slate-300 pb-5">{breakdown.environment_setup}</Text>
                </View>

                <View className="flex items-center pb-5">
                  <Pressable 
                    onPress={handleSubmit}
                    disabled={loading}
                    className="bg-sky-600 py-2 px-2 rounded-lg active:opacity-80 w-1/3"
                  >
                    <Text className="text-slate-200 font-semibold text-center py-1">
                      {loading ? 'Creating...' : 'Create Task'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}