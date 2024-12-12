import pytest
from unittest.mock import AsyncMock, patch

from conftest import get_mock_user, get_mock_task, VALID_TASK_DATA
from models.tasks import TaskRequest, TaskResponse
from models.users import UserResponse
from queries.tasks import TaskQueries
from routes.tasks import create_task, get_tasks, get_task, update_task, delete_task


class TestTasksGoodPath:
    """Test suite for successful task operations."""
    
    @pytest.mark.asyncio
    async def test_create_task(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        mock_task = get_mock_task(current_user.id)
        task_request = TaskRequest(**VALID_TASK_DATA)
        
        with patch.object(TaskQueries, 'create_task', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_task
            
            result = await create_task(
                task=task_request,
                current_user=current_user,
                queries=task_queries
            )
            
            mock_create.assert_called_once_with(task_request, current_user.id)
            assert isinstance(result, TaskResponse)
            assert result.title == VALID_TASK_DATA["title"]
            assert result.user_id == current_user.id

    @pytest.mark.asyncio
    async def test_get_all_tasks(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        mock_tasks = [
            get_mock_task(current_user.id),
            get_mock_task(current_user.id, {"title": "Second Task"})
        ]

        with patch.object(TaskQueries, 'get_tasks', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_tasks

            result = await get_tasks(
                current_user=current_user,
                queries=task_queries
            )

            mock_get.assert_called_once_with(current_user.id)

            assert isinstance(result, list)
            assert len(result) == 2
            assert all(isinstance(task, TaskResponse) for task in result)
            assert all(task.user_id == current_user.id for task in result)
            assert result[1].title == "Second Task"

    @pytest.mark.asyncio
    async def test_get_single_task(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        mock_task = get_mock_task(current_user.id)
        task_id = str(mock_task.id)

        with patch.object(TaskQueries, 'get_task', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_task

            result = await get_task(
                task_id=task_id,
                current_user=current_user,
                queries=task_queries
            )

            mock_get.assert_called_once_with(task_id, current_user.id)

            assert isinstance(result, TaskResponse)
            assert result.id == task_id
            assert result.user_id == current_user.id
            assert result.title == mock_task.title
            assert result.description == mock_task.description

    @pytest.mark.asyncio
    async def test_update_task(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        mock_task = get_mock_task(current_user.id)
        task_id = str(mock_task.id)

        updated_data = VALID_TASK_DATA.copy()
        updated_data["title"] = "Updated Title"
        task_request = TaskRequest(**updated_data)

        with patch.object(TaskQueries, 'update_task', new_callable=AsyncMock) as mock_update:
            mock_update.return_value = get_mock_task(current_user.id, updated_data)

            result = await update_task(
                task_id=task_id,
                task=task_request,
                current_user=current_user, 
                queries=task_queries 
            )

            mock_update.assert_called_once_with(task_id, task_request, current_user.id)

            assert isinstance(result, TaskResponse)
            assert result.title == "Updated Title"
            assert result.user_id == current_user.id

    @pytest.mark.asyncio
    async def test_delete_task(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        mock_task = get_mock_task(current_user.id)
        task_id = str(mock_task.id)
        
        with patch.object(TaskQueries, 'delete_task', new_callable=AsyncMock) as mock_delete:
            result = await delete_task(
                task_id=task_id,
                current_user=current_user,
                queries=task_queries
            )
            
            assert result == {"message": "Task deleted successfully"}
            mock_delete.assert_called_once_with(task_id, current_user.id)

    @pytest.mark.asyncio
    async def test_get_tasks_empty_list(self, task_queries):
        """Test getting tasks when user has none"""
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        
        with patch.object(TaskQueries, 'get_tasks', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = []
            
            result = await get_tasks(
                current_user=current_user,
                queries=task_queries
            )
            
            assert isinstance(result, list)
            assert len(result) == 0
            mock_get.assert_called_once_with(current_user.id)