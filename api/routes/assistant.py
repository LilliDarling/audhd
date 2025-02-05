from datetime import datetime, timezone
import logging
import torch
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
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

async def get_assistant_queries():
    assistant = ADHDAssistantQueries()
    await assistant.initialize()
    return assistant

@router.post("/message", response_model=AssistantResponse)
async def send_message(
    message_data: MessageRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    assistant_queries: ADHDAssistantQueries = Depends(get_assistant_queries),
    task_queries: TaskQueries = Depends(),
    calendar_queries: CalendarQueries = Depends()
) -> JSONResponse:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    try:
        response = await assistant_queries.process_message(
            current_user.id,
            message_data.message,
            task_queries,
            calendar_queries
        )

        if not response or not isinstance(response, dict) or 'content' not in response:
            logger.error(f"Invalid response format: {response}")
            raise HTTPException(status_code=500, detail="Invalid response format from assistant")

        return JSONResponse(
            content=jsonable_encoder(response),
            headers={
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                "Pragma": "no-cache",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY"
            }
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")



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

@router.get("/history", response_model=List[AssistantMessage])
async def get_message_history(
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    assistant_queries: ADHDAssistantQueries = Depends(),
    limit: int = 10
):
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    try:
        messages = await assistant_queries.get_conversation_history(
            user_id=current_user.id,
            limit=limit
        )
        return messages

    except Exception as e:
        logger.error(f"Failed to fetch message history: {e}")
        raise HTTPException(
            status_code=500, 
            detail=str(e)
        )

@router.get("/health")
async def check_health(
    assistant_queries: ADHDAssistantQueries = Depends(get_assistant_queries)
):
    try:
        # Check if initialization is in progress
        if assistant_queries._initialization_lock.locked():
            return {
                "status": "initializing",
                "device": assistant_queries.device,
                "model": assistant_queries.model_name,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        if not assistant_queries._is_initialized:
            await assistant_queries.initialize()

        # Only test the model if it's fully initialized
        if assistant_queries._is_initialized and assistant_queries.model and assistant_queries.tokenizer:
            test_input = "Hello"
            inputs = assistant_queries.tokenizer(test_input, return_tensors="pt", padding=True)
            inputs = {k: v.to(assistant_queries.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = assistant_queries.model.generate(
                    **inputs,
                    max_length=10,
                    num_return_sequences=1,
                )
            
            test_output = assistant_queries.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return {
                "status": "healthy",
                "initialized": True,
                "device": assistant_queries.device,
                "model": assistant_queries.model_name,
                "test_output": test_output,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        else:
            return {
                "status": "initializing",
                "initialized": False,
                "device": assistant_queries.device,
                "model": assistant_queries.model_name,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }