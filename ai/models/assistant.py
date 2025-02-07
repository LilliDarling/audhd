from datetime import datetime, timezone, UTC
from typing import Optional, List
from pydantic import BaseModel
from odmantic import Model, Field

class AssistantMessage(Model):
    user_id: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    type: str = Field(default="user")  # "user" or "assistant"
    category: Optional[str] = Field(default=None)  # "task_breakdown", "motivation", "time_management", etc.

    model_config = {
        "collection": "assistant_messages"
    }

class MessageRequest(BaseModel):
    message: str

class VoiceRequest(BaseModel):
    audio_data: str

class TaskBreakdown(BaseModel):
    main_task: str
    subtasks: List[str]
    estimated_time: int  # minutes
    difficulty_level: int  # 1-3
    energy_level_needed: int  # 1-3
    context_switches: int  # number of different contexts/environments needed
    initiation_tips: List[str]  # specific tips for getting started
    dopamine_hooks: List[str]  # rewarding aspects or motivation hooks
    break_points: List[int]  # suggested indexes in subtasks for taking breaks

class TaskContext(BaseModel):
    time_of_day: str  # morning, afternoon, evening
    energy_level: int  # 1-3
    environment: str  # home, work, etc.
    current_medications: bool  # if user is currently medicated

class AssistantResponse(BaseModel):
    content: str
    task_breakdown: Optional[TaskBreakdown] = None
    suggested_tasks: Optional[List[str]] = None
    calendar_suggestions: Optional[List[dict]] = None
    dopamine_boosters: Optional[List[str]] = None
    focus_tips: Optional[List[str]] = None
    executive_function_supports: Optional[List[dict]] = None  # Specific EF support strategies
    environment_adjustments: Optional[List[str]] = None  # Environmental modification suggestions
    
    @classmethod
    def from_mongo(cls, message: AssistantMessage, suggestions: dict) -> "AssistantResponse":
        return cls(
            content=message.content,
            task_breakdown=suggestions.get("task_breakdown"),
            suggested_tasks=suggestions.get("tasks"),
            calendar_suggestions=suggestions.get("calendar_events"),
            dopamine_boosters=suggestions.get("dopamine_boosters"),
            focus_tips=suggestions.get("focus_tips"),
            executive_function_supports=suggestions.get("ef_supports"),
            environment_adjustments=suggestions.get("environment_tips")
        )