from fastapi import Depends, HTTPException, APIRouter
from bson import ObjectId
from models.tasks import TaskRequest, TaskResponse
from models.users import UserResponse
from queries.tasks import TaskQueries
from utils.authentication import try_get_jwt_user_data
from utils.exceptions import AuthExceptions, UserExceptions, TaskExceptions


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

@router.get("/{task_id}")
async def get_task(
    task_id: str,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> TaskResponse:
    if not current_user:
        raise AuthExceptions.unauthorized()

    try:
        try:
            ObjectId(task_id)
        except Exception:
            raise UserExceptions.invalid_format("task_id", "Invalid task ID format")

        task = await queries.get_task(task_id, current_user.id)
        return TaskResponse.from_mongo(task)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise TaskExceptions.not_found()
        raise UserExceptions.invalid_format("task", str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise UserExceptions.database_error("retrieving task")

@router.put("/{task_id}")
async def update_task(
    task_id: str,
    task: TaskRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> TaskResponse:
    if not current_user:
        raise AuthExceptions.unauthorized()

    try:
        updated_task = await queries.update_task(task_id, task, current_user.id)
        return TaskResponse.from_mongo(updated_task)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise TaskExceptions.not_found()
        raise UserExceptions.invalid_format("task", str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise UserExceptions.database_error("updating task")

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> dict:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    try:
        await queries.delete_task(task_id, current_user.id)
        return {"message": "Task deleted successfully"}
    except ValueError:
        raise TaskExceptions.not_found()
    except HTTPException:
        raise
    except Exception as e:
        raise UserExceptions.database_error("deleting task")