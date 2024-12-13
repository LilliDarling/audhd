from fastapi import APIRouter, Depends
from datetime import datetime, timezone

from models.calendar import CalendarEventRequest, CalendarEventResponse
from models.users import UserResponse
from queries.calendar import CalendarQueries
from queries.tasks import TaskQueries
from utils.authentication import try_get_jwt_user_data
from utils.calendar_mgr import CalendarTokenManager
from utils.exceptions import AuthExceptions, TaskExceptions, CalendarExceptions


router = APIRouter(tags=["Calendar"], prefix="/api/calendar")

@router.get("/connect")
async def get_auth_url(
    current_user: UserResponse = Depends(try_get_jwt_user_data)
) -> dict:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    token_manager = CalendarTokenManager()
    flow = token_manager.create_oauth_flow("your-app://oauth2redirect") # Need the redirect URL
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    return {"auth_url": auth_url}

@router.post("/callback")
async def calendar_callback(
    code: str,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: CalendarQueries = Depends()
) -> dict:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    token_manager = CalendarTokenManager()
    flow = token_manager.create_oauth_flow("your-app://oauth2redirect")  # Need the redirect URL
    
    try:
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        await queries.save_credentials(
            user_id=current_user.id,
            access_token=credentials.token,
            refresh_token=credentials.refresh_token,
            expiry=datetime.fromtimestamp(credentials.expiry.timestamp(), tz=timezone.utc)
        )
        
        return {"message": "Calendar connected successfully"}
    except Exception as e:
        raise CalendarExceptions.invalid_credentials()

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