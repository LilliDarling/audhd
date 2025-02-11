from queries.analyzer import TaskAnalyzer
from models.tasks import Task, TaskRequest
from utils.exceptions import handle_database_operation
from config.database import engine
from bson import ObjectId
import structlog

logger = structlog.get_logger()

class TaskQueries:
    def __init__(self):
        self.analyzer = TaskAnalyzer()
        
    @handle_database_operation("creating task")
    async def create_task(self, task: TaskRequest, user_id: str) -> Task:
        log = logger.bind(user_id=user_id, task_title=task.title)
        log.info("creating_task", priority=task.priority)

        new_task = Task(
            title=task.title,
            description=task.description,
            priority=task.priority,
            status=task.status,
            user_id=user_id,
            context=task.context,
            last_analyzed=False
        )

        try:
            breakdown = await self.analyzer.get_task_breakdown(new_task)
            if breakdown:
                new_task.breakdown = breakdown
                new_task.last_analyzed = True
                log.info("task_breakdown_added")
        
            await engine.save(new_task)
            log.info("task_created", task_id=str(new_task.id))
            return new_task
        except Exception as e:
            log.error("task_creation_failed", error=str(e))
            raise

    @handle_database_operation("retrieving tasks")
    async def get_tasks(self, user_id: str) -> list[Task]:
        log = logger.bind(user_id=user_id)
        log.info("retrieving_all_tasks")
        
        try:
            tasks = await engine.find(Task, Task.user_id == user_id)
            log.info("tasks_retrieved", count=len(tasks))
            return tasks
        except Exception as e:
            log.error("task_retrieval_failed", error=str(e))
            raise
    
    @handle_database_operation("retrieving task")
    async def get_task(self, task_id: str, user_id: str) -> Task:
        log = logger.bind(user_id=user_id, task_id=task_id)
        log.info("retrieving_task")
        
        try:
            task = await engine.find_one(Task, 
                Task.id == ObjectId(task_id), 
                Task.user_id == user_id
            )
            if not task:
                log.warning("task_not_found")
                raise ValueError("Task not found")
            
            log.info("task_retrieved")
            return task
        except Exception as e:
            log.error("task_retrieval_failed", error=str(e))
            raise ValueError("Task not found")
    
    @handle_database_operation("updating task")
    async def update_task(self, task_id: str, task: TaskRequest, user_id: str) -> Task:
        log = logger.bind(user_id=user_id, task_id=task_id)
        log.info("updating_task")

        try:
            existing_task = await engine.find_one(Task, 
                Task.id == ObjectId(task_id), 
                Task.user_id == user_id
            )
            if not existing_task:
                log.warning("task_not_found")
                raise ValueError("Task not found")
            
            content_changed = (
                existing_task.title != task.title or 
                existing_task.description != task.description
            )

            existing_task.title = task.title
            existing_task.description = task.description
            existing_task.priority = task.priority
            existing_task.status = task.status

            if content_changed:
                log.info("task_content_changed", task_id=task_id)
                breakdown = await self.analyzer.get_task_breakdown(existing_task)
                if breakdown:
                    existing_task.breakdown = breakdown
                    existing_task.last_analyzed = True
                    log.info("task_breakdown_updated")

            await engine.save(existing_task)
            log.info("task_updated")
            return existing_task
        
        except Exception as e:
            log.error("task_update_failed", error=str(e))
            raise ValueError("Task not found")
    
    @handle_database_operation("deleting task")
    async def delete_task(self, task_id: str, user_id: str) -> None:
        log = logger.bind(user_id=user_id, task_id=task_id)
        log.info("deleting_task")

        try:
            existing_task = await engine.find_one(Task, 
                Task.id == ObjectId(task_id), 
                Task.user_id == user_id
            )
            if not existing_task:
                log.warning("task_not_found")
                raise ValueError("Task not found")

            await engine.delete(existing_task)
            log.info("task_deleted")
        except Exception as e:
            log.error("task_deletion_failed", error=str(e))
            raise ValueError("Task not found")
    
    @handle_database_operation("regenerating task breakdown")
    async def regenerate_breakdown(self, task_id: str, user_id: str) -> Task:
        """Manually regenerate task breakdown"""
        log = logger.bind(user_id=user_id, task_id=task_id)
        log.info("regenerating_task_breakdown")

        try:
            existing_task = await engine.find_one(Task, 
                Task.id == ObjectId(task_id), 
                Task.user_id == user_id
            )
            if not existing_task:
                log.warning("task_not_found")
                raise ValueError("Task not found")

            breakdown = await self.analyzer.get_task_breakdown(existing_task)
            if breakdown:
                existing_task.breakdown = breakdown
                existing_task.last_analyzed = True
                await engine.save(existing_task)
                log.info("task_breakdown_regenerated")
            
            return existing_task
        except Exception as e:
            log.error("breakdown_regeneration_failed", error=str(e))
            raise ValueError("Task not found")