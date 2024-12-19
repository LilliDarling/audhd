from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta

from models.calendar import CalendarEventRequest, CalendarEventResponse
from models.users import UserResponse
from queries.calendar import CalendarQueries
from queries.tasks import TaskQueries
from config.calendar_mgr import GoogleService
from utils.authentication import try_get_jwt_user_data
from utils.exceptions import TaskExceptions, CalendarExceptions, AuthExceptions


router = APIRouter(tags=["Calendar"], prefix="/api/calendar")

@router.post("/google-auth")
async def handle_google_auth(
    google_token: dict,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: CalendarQueries = Depends()
) -> dict:
    """Handle Google Sign-In token"""
    if not current_user:
        raise AuthExceptions.unauthorized()

    try:
        service = GoogleService()
        
        encrypted_access = service.encrypt_token(google_token["access_token"])
        encrypted_refresh = service.encrypt_token(google_token["refresh_token"])

        await queries.save_google_credentials(
            user_id=current_user.id,
            access_token=encrypted_access,
            refresh_token=encrypted_refresh,
            expiry=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        
        return {"message": "Google Calendar connected successfully"}
    except Exception as e:
        raise CalendarExceptions.operation_failed(str(e))

@router.post("/events")
async def add_task_to_calendar(
    event_request: CalendarEventRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    calendar_queries: CalendarQueries = Depends(),
    task_queries: TaskQueries = Depends()
) -> CalendarEventResponse:
    """Add a task to Google Calendar"""
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