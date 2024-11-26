// src/services/taskService.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, TaskInput } from '../types/task';

export const TaskService = {
  async getTasks(userId: string): Promise<Task[]> {
    console.log('getTasks called with userId:', userId);

    try {
      const tasksRef = collection(db, 'tasks');
      console.log('Querying tasks collection');

      // Create the query
      const q = query(
        tasksRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // Execute the query
      const querySnapshot = await getDocs(q);
      console.log('Raw query results:', querySnapshot.size);

      // Map through the documents with detailed logging
      const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing document:', doc.id, data);

        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
          dueDate: data.dueDate?.toDate(),
          userId: data.userId,
        } as Task;
      });

      console.log('Processed tasks:', tasks);
      return tasks;

    } catch (error) {
      console.error('Error in getTasks:', error);
      throw error;
    }
  },

  async addTask(userId: string, taskData: TaskInput): Promise<Task> {
    console.log('TaskService - Adding task for user:', userId);
    console.log('TaskService - Task data:', taskData);

    try {
      const task = {
        ...taskData,
        userId,
        createdAt: Timestamp.now(),
        completedAt: null,
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskdata.dueDate) : null,
      };

      console.log('TaskService - Prepared task data:', task);
      const docRef = await addDoc(collection(db, 'tasks'), task);
      console.log('TaskService - Task added with ID:', docRef.id);

      return {
        ...taskData,
        id: docRef.id,
        userId,
        createdAt: new Date(),
        completed: false,
        dueDate: taskData.dueDate,
      } as Task;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const updateData = { ...updates };

      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      }
      if (updates.completedAt) {
        updateData.completedAt = Timestamp.fromDate(updates.completedAt);
      }

      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        completed,
        completedAt: completed ? Timestamp.now() : null,
      });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  },
};
