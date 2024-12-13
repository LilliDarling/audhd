from datetime import datetime
from typing import Optional

from models.calendar import CalendarCredentials, CalendarEventRequest, CalendarEventResponse
from models.tasks import Task
from utils.calendar_mgr import CalendarTokenManager, create_calendar_service
from utils.exceptions import CalendarExceptions
from utils.database import engine
from utils.exceptions import handle_database_operation

class CalendarQueries:
    def __init__(self):
        self.token_manager = CalendarTokenManager()

    @handle_database_operation("saving calendar credentials")
    async def save_credentials(
        self, 
        user_id: str, 
        access_token: str, 
        refresh_token: str, 
        expiry: datetime
    ) -> None:
        credentials = CalendarCredentials(
            user_id=user_id,
            encrypted_access_token=self.token_manager.encrypt_token(access_token),
            encrypted_refresh_token=self.token_manager.encrypt_token(refresh_token),
            token_expiry=expiry
        )
        await engine.save(credentials)

    @handle_database_operation("retrieving calendar credentials")
    async def get_credentials(self, user_id: str) -> Optional[CalendarCredentials]:
        return await engine.find_one(
            CalendarCredentials, 
            CalendarCredentials.user_id == user_id
        )

    async def add_event_to_calendar(
        self, 
        user_id: str, 
        task: Task, 
        event_request: CalendarEventRequest
    ) -> CalendarEventResponse:
        credentials_doc = await self.get_credentials(user_id)
        if not credentials_doc:
            raise CalendarExceptions.not_connected()

        try:
            credentials = self.token_manager.create_credentials(
                credentials_doc.encrypted_access_token,
                credentials_doc.encrypted_refresh_token
            )
            service = create_calendar_service(credentials)
            
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
            raise CalendarExceptions.operation_failed("adding event to calendar")