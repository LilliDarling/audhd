export interface CalendarEventRequest {
    task_id: string;
    start_time: string;
    end_time: string;
    notification_minutes?: number;
  }
  
export interface CalendarEventResponse {
    event_id: string;
    task_id: string;
    calendar_link: string;
}