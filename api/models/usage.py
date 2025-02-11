from datetime import datetime, timezone
from typing import Optional
from odmantic import Model, Field as ODMField
from pydantic import BaseModel

class UserAPIUsage(Model):
    user_id: str
    date: datetime
    generation_count: int = ODMField(default=0)
    last_updated: datetime = ODMField(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {
        "collection": "user_api_usage"
    }

class UsageResponse(BaseModel):
    daily_limit: int
    generations_used: int
    generations_remaining: int

    @classmethod
    def from_usage(cls, usage: Optional[UserAPIUsage], daily_limit: int) -> "UsageResponse":
        generations_used = usage.generation_count if usage else 0
        return cls(
            daily_limit=daily_limit,
            generations_used=generations_used,
            generations_remaining=daily_limit - generations_used
        )