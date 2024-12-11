from odmantic import Model, Field
from pydantic import BaseModel


class TaskRequest(BaseModel):
    title: str = Field(min_length=5, max_length=30)
    description: str = Field(min_length=5, max_length=100)
    priority: int = Field(ge=1, le=3)
    status: str = Field(default="pending")

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