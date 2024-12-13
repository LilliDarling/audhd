from odmantic import Model, Field
from pydantic import BaseModel, Field as PydanticField
from datetime import datetime
from typing import Optional

class CalendarCredentials(Model):
    user_id: str = Field(unique=True)
    encrypted_access_token: str
    encrypted_refresh_token: str
    token_expiry: datetime

    model_config = {
        "collection": "calendar_credentials"
    }

class CalendarEventRequest(BaseModel):
    task_id: str
    start_time: datetime
    end_time: datetime
    notification_minutes: Optional[int] = PydanticField(default=30, ge=0)

class CalendarEventResponse(BaseModel):
    event_id: str
    task_id: str
    calendar_link: str
    
    @classmethod
    def from_google_event(cls, event: dict, task_id: str) -> "CalendarEventResponse":
        return cls(
            event_id=event['id'],
            task_id=task_id,
            calendar_link=event.get('htmlLink', '')
        )