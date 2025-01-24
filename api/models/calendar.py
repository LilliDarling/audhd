from odmantic import Model, Field
from pydantic import BaseModel, Field as PydanticField, model_validator
from datetime import datetime
from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId

class GoogleCredentials(Model):
    user_id: str = Field(unique=True)
    encrypted_access_token: str
    encrypted_refresh_token: str
    token_expiry: datetime

    model_config = {
        "collection": "calendar_credentials"
    }

class CalendarEventRequest(BaseModel):
    task_id: str = PydanticField(min_length=24, max_length=24)
    start_time: datetime
    end_time: datetime
    notification_minutes: Optional[int] = PydanticField(default=30, ge=0)

    @model_validator(mode='after')
    def validate_times_and_task_id(self) -> 'CalendarEventRequest':
        try:
            ObjectId(self.task_id)
        except InvalidId:
            raise ValueError("Invalid MongoDB ObjectId format")

        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        
        return self

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