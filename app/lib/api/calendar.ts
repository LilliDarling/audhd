import { api } from './client';

interface CalendarEventRequest {
  task_id: string;
  start_time: string;
  end_time: string;
  notification_minutes?: number;
}

interface CalendarEventResponse {
  event_id: string;
  task_id: string;
  calendar_link: string;
}

export const calendarApi = {
  connectGoogle: async (googleToken: { access_token: string; refresh_token: string }) => {
    const response = await api.post('/api/calendar/google-auth', googleToken);
    return response.data;
  },

  addTaskToCalendar: async (eventData: CalendarEventRequest): Promise<CalendarEventResponse> => {
    const response = await api.post('/api/calendar/events', eventData);
    return response.data;
  }
};