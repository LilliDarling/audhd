from models.tasks import Task, TaskRequest
from utils.exceptions import handle_database_operation
from utils.database import engine

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
