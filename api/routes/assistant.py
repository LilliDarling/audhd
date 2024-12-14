from fastapi import APIRouter, Depends
from typing import List

from models.users import UserResponse
from models.assistant import AssistantResponse, AssistantMessage, VoiceRequest
from queries.assistant import ADHDAssistantQueries
from queries.tasks import TaskQueries
from queries.calendar import CalendarQueries
from utils.authentication import try_get_jwt_user_data
from utils.exceptions import AuthExceptions


router = APIRouter(tags=["ADHD Assistant"], prefix="/api/assistant")

@router.post("/message")
async def send_message(
    message: str,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    assistant_queries: ADHDAssistantQueries = Depends(),
    task_queries: TaskQueries = Depends(),
    calendar_queries: CalendarQueries = Depends()
) -> AssistantResponse:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    return await assistant_queries.process_message(
        current_user.id,
        message,
        task_queries,
        calendar_queries
    )

@router.post("/voice")
async def send_voice(
    voice_request: VoiceRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    assistant_queries: ADHDAssistantQueries = Depends(),
    task_queries: TaskQueries = Depends(),
    calendar_queries: CalendarQueries = Depends()
) -> AssistantResponse:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    return await assistant_queries.process_voice(
        current_user.id,
        voice_request.audio_data,
        task_queries,
        calendar_queries
    )

@router.get("/history")
async def get_history(
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    assistant_queries: ADHDAssistantQueries = Depends(),
    limit: int = 10
) -> List[AssistantMessage]:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    return await assistant_queries.get_conversation_history(current_user.id, limit)