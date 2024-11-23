// src/components/TaskForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { TaskPriority, TaskCategory, TaskInput } from '../types/task';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: TaskInput) => Promise<void>;
  initialValues?: Partial<TaskInput>;
}

export const TaskForm = ({ visible, onClose, onSubmit, initialValues }: TaskFormProps) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority || 'medium');
  const [category, setCategory] = useState<TaskCategory>(initialValues?.category || 'personal');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialValues?.dueDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datePickerAttempts, setDatePickerAttempts] = useState(0); // debug counter

  const priorities: TaskPriority[] = ['high', 'medium', 'low'];
  const categories: TaskCategory[] = ['personal', 'work', 'health', 'chores', 'other'];

  // Separate function to handle date picker visibility
  const handleOpenDatePicker = () => {
    console.log('Attempting to open date picker', {
      currentVisibility: showDatePicker,
      platform: Platform.OS,
      attempts: datePickerAttempts + 1
    });

    setDatePickerAttempts(prev => prev + 1);
    setShowDatePicker(true);
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    console.log('Date picker event:', {
      eventType: event.type,
      selectedDate,
      platform: Platform.OS
    });

    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    console.log('TaskForm - Starting submission');
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate,
        completed: false,
      };

      console.log('TaskForm - Submitting task data: ', taskData);
      await onSubmit(taskData);
      console.log('TaskForm - Task submitted successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle date picker visibility
  const openDatePicker = () => {
    console.log('Opening date picker');
    setShowDatePicker(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.formContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
              {initialValues ? 'Edit Task' : 'New Task'}
            </Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={colors.neutral.gray400}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor={colors.neutral.gray400}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.optionsContainer}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.option,
                    priority === p && styles.selectedOption,
                    { backgroundColor: priority === p ? getPriorityColor(p) : colors.neutral.gray100 }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                    styles.optionText,
                    priority === p && styles.selectedOptionText
                  ]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.optionsContainer}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.option,
                    category === c && styles.selectedOption,
                  ]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[
                    styles.optionText,
                    category === c && styles.selectedOptionText
                  ]}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={openDatePicker}
            >
              <Text style={styles.dateButtonText}>
                {dueDate ? dueDate.toLocaleDateString() : 'Set due date'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                onChange={(event, selectedDate) => {
                  console.log('Date selected: ', selectedDate);
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.neutral.white} />
                ) : (
                  <Text style={styles.buttonText}>
                    {initialValues ? 'Update' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'high': return colors.primary.red;
    case 'medium': return colors.primary.orange;
    case 'low': return colors.primary.green;
    default: return colors.neutral.gray400;
  }
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.blue,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.neutral.gray900,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray100,
  },
  selectedOption: {
    backgroundColor: colors.primary.blue,
  },
  optionText: {
    fontSize: 14,
    color: colors.neutral.gray700,
  },
  selectedOptionText: {
    color: colors.neutral.white,
    fontWeight: '500',
  },
  dateButton: {
    backgroundColor: colors.neutral.gray100,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.neutral.gray900,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.neutral.gray200,
  },
  submitButton: {
    backgroundColor: colors.primary.blue,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
