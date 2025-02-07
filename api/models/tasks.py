from datetime import datetime, timezone
from odmantic import Model
from pydantic import BaseModel, field_validator, Field
from typing import List, Optional


class TaskStep(BaseModel):
    description: str
    time_estimate: int
    initiation_tip: str
    completion_signal: str
    focus_strategy: str
    dopamine_hook: str


class TaskBreakdown(BaseModel):
    steps: List[TaskStep]
    suggested_breaks: List[int]  # step indices where breaks are recommended
    adhd_supports: List[str]  # specific ADHD-friendly strategies for this task
    initiation_strategy: str  # specific strategy to help start the task
    energy_level_needed: int = Field(ge=1, le=3)  # energy requirement rating
    context_switches: int  # number of changes in environment/tools needed
    materials_needed: List[str]  # tools, resources, or materials required
    environment_setup: List[str]  # environmental modifications needed


class TaskContext(BaseModel):
    time_of_day: str = Field(default="any")  # morning, afternoon, evening, any
    energy_level: int = Field(default=2, ge=1, le=3)
    environment: str = Field(default="any")  # home, work, etc.
    current_medications: bool = Field(default=False)

    @field_validator('time_of_day')
    @classmethod
    def validate_time_of_day(cls, v: str) -> str:
        valid_times = ["morning", "afternoon", "evening", "any"]
        if v.lower() not in valid_times:
            raise ValueError(f"Time of day must be one of: {', '.join(valid_times)}")
        return v.lower()

    @field_validator('environment')
    @classmethod
    def validate_environment(cls, v: str) -> str:
        valid_environments = ["home", "work", "school", "outside", "any"]
        if v.lower() not in valid_environments:
            raise ValueError(f"Environment must be one of: {', '.join(valid_environments)}")
        return v.lower()


class TaskRequest(BaseModel):
    title: str = Field(min_length=5, max_length=30)
    description: str = Field(min_length=5, max_length=100)
    priority: int = Field(ge=1, le=3)
    status: str = Field(default="pending")
    context: Optional[TaskContext] = None  # Make context optional

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
    context: Optional[TaskContext] = None
    breakdown: Optional[TaskBreakdown] = None
    last_analyzed: Optional[bool] = Field(default=False)

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
    context: Optional[TaskContext] = None
    breakdown: Optional[TaskBreakdown] = None
    last_analyzed: Optional[bool] = None

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
            user_id=task.user_id,
            context=task.context,
            breakdown=task.breakdown,
            last_analyzed=task.last_analyzed
        )

class TaskCache(Model):
    task_key: str
    breakdown: str
    created_at: datetime = datetime.now(timezone.utc)

    model_config = {
        "collection": "task_cache"
    }