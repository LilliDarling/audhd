from email.header import Header
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional

from models.calendar import CalendarEventRequest, CalendarEventResponse
from models.users import UserResponse
from queries.calendar import CalendarQueries
from queries.tasks import TaskQueries
from utils.authentication import try_get_jwt_user_data
from config.calendar_mgr import CalendarTokenManager
from utils.exceptions import AuthExceptions, TaskExceptions, CalendarExceptions


router = APIRouter(tags=["Calendar"], prefix="/api/calendar")

class SupabaseAuthBearer:
    async def __call__(
        self,
        token: Optional[str] = Header(None, alias="Authorization")
    ) -> dict:
        if not token:
            raise AuthExceptions.unauthorized()
            
        if not token.startswith("Bearer "):
            raise AuthExceptions.unauthorized()
            
        token = token.split(" ")[1]
        token_manager = CalendarTokenManager()
        
        try:
            user_data = await token_manager.verify_session(token)
            return user_data
        except ValueError as e:
            raise AuthExceptions.unauthorized(str(e))

@router.post("/connect")
async def connect_calendar(
    current_user: dict = Depends(SupabaseAuthBearer()),
    queries: CalendarQueries = Depends()
) -> dict:
    try:
        provider_token = current_user['user']['app_metadata'].get('provider_token')
        provider_refresh_token = current_user['user']['app_metadata'].get('provider_refresh_token')
        
        if not provider_token or not provider_refresh_token:
            raise HTTPException(
                status_code=400,
                detail="No Google account linked to user"
            )
        
        token_manager = CalendarTokenManager()

        await queries.save_credentials(
            user_id=current_user['user']['id'],
            access_token=provider_token,
            refresh_token=provider_refresh_token,
            expiry=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        
        return {"message": "Calendar connected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/events")
async def add_task_to_calendar(
    event_request: CalendarEventRequest,
    current_user: dict = Depends(SupabaseAuthBearer()),
    calendar_queries: CalendarQueries = Depends(),
    task_queries: TaskQueries = Depends()
) -> CalendarEventResponse:
    task = await task_queries.get_task(event_request.task_id, current_user['user']['id'])
    if not task:
        raise TaskExceptions.not_found()
    
    return await calendar_queries.add_event_to_calendar(
        current_user['user']['id'],
        task,
        event_request
    )