import { CalendarEventRequest, CalendarEventResponse } from '../types/calendar';
import { api } from './client';


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