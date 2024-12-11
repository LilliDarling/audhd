from models.tasks import Task, TaskRequest
from utils.exceptions import handle_database_operation
from utils.database import engine
from bson import ObjectId

class TaskQueries:
    @handle_database_operation("creating task")
    async def create_task(self, task: TaskRequest, user_id: str) -> Task:
        new_task = Task(
            title=task.title,
            description=task.description,
            priority=task.priority,
            status=task.status,
            user_id=user_id
        )
        await engine.save(new_task)
        return new_task

    @handle_database_operation("retrieving tasks")
    async def get_tasks(self, user_id: str) -> list[Task]:
        tasks = await engine.find(Task, Task.user_id == user_id)
        return tasks
    
    @handle_database_operation("retrieving task")
    async def get_task(self, task_id: str, user_id: str) -> Task:
        try:
            task = await engine.find_one(Task, 
                Task.id == ObjectId(task_id), 
                Task.user_id == user_id
            )
            if not task:
                raise ValueError("Task not found")
            return task
        except Exception:
            raise ValueError("Task not found")
    
    @handle_database_operation("updating task")
    async def update_task(self, task_id: str, task: TaskRequest, user_id: str) -> Task:
        try:
            existing_task = await engine.find_one(Task, 
                Task.id == ObjectId(task_id), 
                Task.user_id == user_id
            )
            if not existing_task:
                raise ValueError("Task not found")

            existing_task.title = task.title
            existing_task.description = task.description
            existing_task.priority = task.priority
            existing_task.status = task.status

            await engine.save(existing_task)
            return existing_task
        except Exception:
            raise ValueError("Task not found")
    
    @handle_database_operation("deleting task")
    async def delete_task(self, task_id: str, user_id: str) -> None:
        try:
            existing_task = await engine.find_one(Task, 
                Task.id == ObjectId(task_id), 
                Task.user_id == user_id
            )
            if not existing_task:
                raise ValueError("Task not found")

            await engine.delete(existing_task)
        except Exception:
            raise ValueError("Task not found")