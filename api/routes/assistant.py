import logging
from fastapi import APIRouter, Depends, Request, HTTPException
from typing import List

from models.users import UserResponse
from models.assistant import AssistantResponse, AssistantMessage, VoiceRequest, MessageRequest
from queries.assistant import ADHDAssistantQueries
from queries.tasks import TaskQueries
from queries.calendar import CalendarQueries
from utils.authentication import try_get_jwt_user_data
from utils.exceptions import AuthExceptions


router = APIRouter(tags=["ADHDAssistant"], prefix="/api/assistant")

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@router.post("/message", response_model=AssistantResponse)
async def send_message(
    request: Request,
    message_data: MessageRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    assistant_queries: ADHDAssistantQueries = Depends(),
    task_queries: TaskQueries = Depends(),
    calendar_queries: CalendarQueries = Depends()
) -> AssistantResponse:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    try:
        # Add request context logging
        logger.info(f"Processing message for user {current_user.id}")
        logger.debug(f"Message content: {message_data.message[:50]}...")
        
        response = await assistant_queries.process_message(
            current_user.id,
            message_data.message,
            task_queries,
            calendar_queries
        )
        
        # Add response validation
        if not response or not response.get('content'):
            raise HTTPException(
                status_code=500,
                detail="Invalid response from assistant"
            )
            
        return response
        
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process message"
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