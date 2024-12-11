from fastapi import Depends, HTTPException, APIRouter
from models.tasks import TaskRequest, TaskResponse
from models.users import UserResponse
from queries.tasks import TaskQueries
from utils.authentication import try_get_jwt_user_data
from utils.exceptions import AuthExceptions, UserExceptions


router = APIRouter(tags=["Tasks"], prefix="/api/tasks")

@router.post("/create")
async def create_task(
    task: TaskRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> TaskResponse:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    try:
        new_task = await queries.create_task(task, current_user.id)
        return TaskResponse.from_mongo(new_task)
    except HTTPException:
        raise
    except Exception as e:
        raise UserExceptions.database_error("creating task")

@router.get("/all")
async def get_tasks(
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> list[TaskResponse]:
    if not current_user:
        raise AuthExceptions.unauthorized()

    try:
        tasks = await queries.get_tasks(current_user.id)
        return [TaskResponse.from_mongo(task) for task in tasks]
    except HTTPException:
        raise
    except Exception as e:
        raise UserExceptions.database_error("retrieving tasks")