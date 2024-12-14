from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone

from models.calendar import CalendarEventRequest, CalendarEventResponse, FirebaseTokenRequest
from models.users import UserResponse
from queries.calendar import CalendarQueries
from queries.tasks import TaskQueries
from utils.authentication import try_get_jwt_user_data
from config.calendar_mgr import CalendarTokenManager
from utils.exceptions import AuthExceptions, TaskExceptions, CalendarExceptions


router = APIRouter(tags=["Calendar"], prefix="/api/calendar")

@router.post("/connect")
async def connect_calendar(
    token_request: FirebaseTokenRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: CalendarQueries = Depends()
) -> dict:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    token_manager = CalendarTokenManager()
    
    try:
        firebase_user = await token_manager.verify_firebase_token(token_request.firebase_token)
        
        credentials = token_manager.create_credentials_from_firebase(firebase_user)
        if not credentials:
            raise HTTPException(
                status_code=400,
                detail="No Google account linked to Firebase user"
            )
        
        await queries.save_credentials(
            user_id=current_user.id,
            access_token=credentials.token,
            refresh_token=credentials.refresh_token,
            expiry=datetime.fromtimestamp(credentials.expiry.timestamp(), tz=timezone.utc)
        )
        
        return {"message": "Calendar connected successfully"}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/events")
async def add_task_to_calendar(
    event_request: CalendarEventRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    calendar_queries: CalendarQueries = Depends(),
    task_queries: TaskQueries = Depends()
) -> CalendarEventResponse:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    task = await task_queries.get_task(event_request.task_id, current_user.id)
    if not task:
        raise TaskExceptions.not_found()
    
    return await calendar_queries.add_event_to_calendar(
        current_user.id,
        task,
        event_request
    )