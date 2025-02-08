from datetime import datetime, timezone
from odmantic import Model, Field

class UserAPIUsage(Model):
    user_id: str
    date: datetime
    generation_count: int = 0
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {
        "collection": "user_api_usage"
    }