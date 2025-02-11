import structlog
from datetime import datetime, timezone
from models.usage import UsageResponse, UserAPIUsage
from fastapi import Depends, HTTPException, APIRouter
from bson import ObjectId
from models.tasks import Task, TaskRequest, TaskResponse
from models.users import UserResponse
from queries.tasks import TaskQueries
from queries.analyzer import TaskAnalyzer
from utils.authentication import try_get_jwt_user_data
from utils.exceptions import AuthExceptions, UserExceptions, TaskExceptions
from config.database import engine

logger = structlog.get_logger()
router = APIRouter(tags=["Tasks"], prefix="/api/tasks")

router = APIRouter(tags=["Tasks"], prefix="/api/tasks")

@router.get("/usage", response_model=UsageResponse)
async def get_task_generation_usage(
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> UsageResponse:
    log = logger.bind(user_id=current_user.id if current_user else None)
    log.info("checking_task_generation_usage")
    
    if not current_user:
        log.warning("unauthorized_usage_check")
        raise AuthExceptions.unauthorized()
    
    try:
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        usage = await engine.find_one(
            UserAPIUsage, 
            UserAPIUsage.user_id == current_user.id,
            UserAPIUsage.date == today
        )

        log.info(
            "usage_retrieved",
            generations_used=usage.generation_count if usage else 0,
            daily_limit=queries.analyzer.daily_limit
        )
        
        return UsageResponse.from_usage(usage, queries.analyzer.daily_limit)
        
    except Exception as e:
        log.error("usage_check_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get usage information")

@router.post("/create")
async def create_task(
    task: TaskRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> TaskResponse:
    log = logger.bind(
        user_id=current_user.id if current_user else None,
        task_title=task.title
    )
    log.info("creating_task")

    if not current_user:
        log.warning("unauthorized_task_creation")
        raise AuthExceptions.unauthorized()
    
    try:
        new_task = await queries.create_task(task, current_user.id)
        log.info("task_created", task_id=str(new_task.id))
        return TaskResponse.from_mongo(new_task)
    
    except Exception as e:
        log.error("task_creation_failed", error=str(e))
        raise UserExceptions.database_error("creating task")


@router.post("/generate")
async def generate_task_breakdown(
    task_request: TaskRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> dict:
    log = logger.bind(
        user_id=current_user.id if current_user else None,
        task_title=task_request.title
    )
    log.info("generating_standalone_breakdown")

    if not current_user:
        log.warning("unauthorized_breakdown_generation")
        raise AuthExceptions.unauthorized()
    
    try:
        temp_task = Task(
            title=task_request.title,
            description=task_request.description,
            priority=task_request.priority,
            status=task_request.status,
            user_id=current_user.id,
            context=task_request.context
        )
        
        analyzer = TaskAnalyzer()
        breakdown = await analyzer.get_task_breakdown(temp_task)
        
        if not breakdown:
            log.error("breakdown_generation_failed")
            raise HTTPException(status_code=500, detail="Failed to generate task breakdown")
            
        log.info("breakdown_generated_successfully")
        return {"breakdown": breakdown.dict()}
        
    except Exception as e:
        log.error("breakdown_generation_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all")
async def get_tasks(
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> list[TaskResponse]:
    log = logger.bind(user_id=current_user.id if current_user else None)
    log.info("retrieving_all_tasks")

    if not current_user:
        log.warning("unauthorized_tasks_retrieval")
        raise AuthExceptions.unauthorized()

    try:
        tasks = await queries.get_tasks(current_user.id)
        log.info("tasks_retrieved", count=len(tasks))
        return [TaskResponse.from_mongo(task) for task in tasks]
    except Exception as e:
        log.error("tasks_retrieval_failed", error=str(e))
        raise UserExceptions.database_error("retrieving tasks")

@router.get("/{task_id}")
async def get_task(
    task_id: str,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> TaskResponse:
    log = logger.bind(
        user_id=current_user.id if current_user else None,
        task_id=task_id
    )
    log.info("retrieving_task")

    if not current_user:
        log.warning("unauthorized_task_retrieval")
        raise AuthExceptions.unauthorized()

    try:
        try:
            ObjectId(task_id)
        except Exception as e:
            log.warning("invalid_task_id_format", error=str(e))
            raise UserExceptions.invalid_format("task_id", "Invalid task ID format")

        task = await queries.get_task(task_id, current_user.id)
        log.info("task_retrieved")
        return TaskResponse.from_mongo(task)
    except ValueError as e:
        if "not found" in str(e).lower():
            log.warning("task_not_found")
            raise TaskExceptions.not_found()
        log.error("task_retrieval_validation_error", error=str(e))
        raise UserExceptions.invalid_format("task", str(e))
    except Exception as e:
        log.error("task_retrieval_failed", error=str(e))
        raise UserExceptions.database_error("retrieving task")

@router.put("/{task_id}")
async def update_task(
    task_id: str,
    task: TaskRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> TaskResponse:
    log = logger.bind(
        user_id=current_user.id if current_user else None,
        task_id=task_id,
        task_title=task.title
    )
    log.info("updating_task")

    if not current_user:
        log.warning("unauthorized_task_update")
        raise AuthExceptions.unauthorized()

    try:
        updated_task = await queries.update_task(task_id, task, current_user.id)
        log.info("task_updated")
        return TaskResponse.from_mongo(updated_task)
    except ValueError as e:
        if "not found" in str(e).lower():
            log.warning("task_not_found")
            raise TaskExceptions.not_found()
        log.error("task_update_validation_error", error=str(e))
        raise UserExceptions.invalid_format("task", str(e))
    except Exception as e:
        log.error("task_update_failed", error=str(e))
        raise UserExceptions.database_error("updating task")

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> dict:
    log = logger.bind(
        user_id=current_user.id if current_user else None,
        task_id=task_id
    )
    log.info("deleting_task")

    if not current_user:
        log.warning("unauthorized_task_deletion")
        raise AuthExceptions.unauthorized()
    
    try:
        await queries.delete_task(task_id, current_user.id)
        log.info("task_deleted")
        return {"message": "Task deleted successfully"}
    except ValueError:
        log.warning("task_not_found")
        raise TaskExceptions.not_found()
    except Exception as e:
        log.error("task_deletion_failed", error=str(e))
        raise UserExceptions.database_error("deleting task")
    
@router.post("/{task_id}/regenerate-breakdown")
async def regenerate_task_breakdown(
    task_id: str,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: TaskQueries = Depends(),
) -> TaskResponse:
    """Endpoint to manually regenerate task breakdown"""
    log = logger.bind(
        user_id=current_user.id if current_user else None,
        task_id=task_id
    )
    log.info("regenerating_task_breakdown")

    if not current_user:
        log.warning("unauthorized_breakdown_regeneration")
        raise AuthExceptions.unauthorized()
    
    try:
        updated_task = await queries.regenerate_breakdown(task_id, current_user.id)
        log.info("breakdown_regenerated")
        return TaskResponse.from_mongo(updated_task)
    except ValueError:
        log.warning("task_not_found")
        raise TaskExceptions.not_found()
    except Exception as e:
        log.error("breakdown_regeneration_failed", error=str(e))
        raise UserExceptions.database_error("regenerating task breakdown")
