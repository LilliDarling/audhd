from datetime import datetime
from typing import Optional

from models.calendar import GoogleCredentials, CalendarEventRequest, CalendarEventResponse
from models.tasks import Task
from config.calendar_mgr import GoogleService
from utils.exceptions import CalendarExceptions
from config.database import engine
from utils.exceptions import handle_database_operation

class CalendarQueries:
    def __init__(self):
        self.google_service = GoogleService()

    @handle_database_operation("saving google credentials")
    async def save_google_credentials(
        self,
        user_id: str,
        access_token: str,
        refresh_token: str,
        expiry: datetime
    ) -> None:
        credentials = GoogleCredentials(
            user_id=user_id,
            encrypted_access_token=self.google_service.encrypt_token(access_token),
            encrypted_refresh_token=self.google_service.encrypt_token(refresh_token),
            token_expiry=expiry
        )
        await engine.save(credentials)

    @handle_database_operation("retrieving google credentials")
    async def get_google_credentials(self, user_id: str) -> Optional[GoogleCredentials]:
        return await engine.find_one(
            GoogleCredentials, 
            GoogleCredentials.user_id == user_id
        )

    async def add_event_to_calendar(
        self,
        user_id: str,
        task: Task,
        event_request: CalendarEventRequest
    ) -> CalendarEventResponse:
        credentials_doc = await self.get_google_credentials(user_id)
        if not credentials_doc:
            raise CalendarExceptions.not_connected()

        try:
            credentials = self.google_service.create_credentials(
                credentials_doc.encrypted_access_token,
                credentials_doc.encrypted_refresh_token
            )
            service = self.google_service.create_calendar_service(credentials)
            
            event = {
                'summary': task.title,
                'description': task.description,
                'start': {
                    'dateTime': event_request.start_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': event_request.end_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'popup', 'minutes': event_request.notification_minutes}
                    ]
                }
            }
            
            created_event = service.events().insert(calendarId='primary', body=event).execute()
            return CalendarEventResponse(
                event_id=created_event['id'],
                task_id=str(task.id),
                calendar_link=created_event.get('htmlLink', '')
            )
        except Exception as e:
            raise CalendarExceptions.operation_failed(str(e))