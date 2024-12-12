from odmantic import Model
from pydantic import BaseModel, field_validator, Field


class TaskRequest(BaseModel):
    title: str = Field(min_length=5, max_length=30)
    description: str = Field(min_length=5, max_length=100)
    priority: int = Field(ge=1, le=3)
    status: str = Field(default="pending")

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = ["pending", "in_progress", "completed"]
        if v.lower() not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v.lower()

class Task(Model):
    title: str
    description: str
    priority: int
    status: str
    user_id: str

    model_config = {
        "collection": "tasks"
    }

class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    priority: int
    status: str
    user_id: str

    @classmethod
    def from_mongo(cls, task: Task) -> "TaskResponse":
        """
        Convert from MongoDB model to response model
        """
        return cls(
            id=str(task.id),
            title=task.title,
            description=task.description,
            priority=task.priority,
            status=task.status,
            user_id=task.user_id
        )