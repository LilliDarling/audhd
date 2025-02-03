import { useState, useCallback } from 'react';
import { calendarApi } from '@/lib/api/calendar';

export function useCalendar() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connectCalendar = useCallback(async (googleToken: { 
    access_token: string; 
    refresh_token: string 
  }) => {
    try {
      setIsConnecting(true);
      await calendarApi.connectGoogle(googleToken);
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const addTaskToCalendar = useCallback(async (taskId: string, startTime: Date, endTime: Date) => {
    try {
      const response = await calendarApi.addTaskToCalendar({
        task_id: taskId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notification_minutes: 30
      });
      return response;
    } catch (error) {
      console.error('Failed to add task to calendar:', error);
      throw error;
    }
  }, []);

  return {
    isConnecting,
    isConnected,
    connectCalendar,
    addTaskToCalendar
  };
}