import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException, status
from pydantic import ValidationError
from bson import ObjectId

from conftest import get_mock_task, get_mock_user, VALID_TASK_DATA
from models.tasks import TaskRequest, TaskResponse
from models.users import UserResponse
from queries.tasks import TaskQueries
from routes.tasks import create_task, delete_task, get_task, update_task


class TestTasksBadPath:
    """Test suite for task operation failure scenarios."""

    @pytest.mark.asyncio
    async def test_create_task_no_auth(self, queries):
        task_request = TaskRequest(**VALID_TASK_DATA)
        
        with pytest.raises(HTTPException) as exc_info:
            await create_task(
                task=task_request,
                current_user=None,
                queries=queries
            )
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Not authenticated"

    @pytest.mark.asyncio
    async def test_get_nonexistent_task(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        task_id = str(ObjectId())
        
        with patch('queries.tasks.TaskQueries.get_task', new_callable=AsyncMock) as mock_get:
            mock_get.side_effect = ValueError("Task not found")

            with pytest.raises(HTTPException) as exc_info:
                await get_task(
                    task_id=task_id,
                    current_user=current_user,
                    queries=task_queries
                )

            assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
            assert "not found" in str(exc_info.value.detail).lower()
            mock_get.assert_called_once_with(task_id, current_user.id)

    @pytest.mark.asyncio 
    async def test_update_task_invalid_priority(self):
        invalid_data = VALID_TASK_DATA.copy()
        invalid_data["priority"] = 5 
        
        with pytest.raises(ValidationError) as exc_info:
            TaskRequest(
                title=invalid_data["title"],
                description=invalid_data["description"],
                priority=invalid_data["priority"],
                status=invalid_data["status"]
            )
        
        error_dict = exc_info.value.errors()
        assert any(error["type"] == "less_than_equal" for error in error_dict)
        assert any("priority" in str(error["loc"]) for error in error_dict)

    @pytest.mark.asyncio
    async def test_create_task_empty_title(self):
        invalid_data = VALID_TASK_DATA.copy()
        invalid_data["title"] = ""
        
        with pytest.raises(ValidationError) as exc_info:
            TaskRequest(
                title=invalid_data["title"],
                description=invalid_data["description"],
                priority=invalid_data["priority"],
                status=invalid_data["status"]
            )
        
        error_dict = exc_info.value.errors()
        assert any(error["type"] == "string_too_short" for error in error_dict)
        assert any("title" in str(error["loc"]) for error in error_dict)

    @pytest.mark.asyncio
    async def test_update_nonexistent_task(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        task_request = TaskRequest(**VALID_TASK_DATA)
        
        with patch.object(TaskQueries, 'update_task', new_callable=AsyncMock) as mock_update:
            mock_update.side_effect = ValueError("Task not found")
            
            with pytest.raises(HTTPException) as exc_info:
                await update_task(
                    task_id="nonexistent_id",
                    task=task_request,
                    current_user=current_user,
                    queries=task_queries
                )
            
            assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
            assert exc_info.value.detail == "Task not found"
            mock_update.assert_called_once_with("nonexistent_id", task_request, current_user.id)
    
    @pytest.mark.asyncio
    async def test_invalid_priority_boundaries(self):
        """Test priority must be between 1 and 3"""
        test_cases = [
            {"priority": 0, "error": "greater than or equal"},
            {"priority": 4, "error": "less than or equal"}
        ]
        
        for case in test_cases:
            data = VALID_TASK_DATA.copy()
            data["priority"] = case["priority"]
            
            with pytest.raises(ValidationError) as exc_info:
                TaskRequest(**data)
            assert case["error"] in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_invalid_status_values(self):
        """Test only allowed status values are accepted"""
        data = VALID_TASK_DATA.copy()
        data["status"] = "invalid_status"
        
        with pytest.raises(ValidationError) as exc_info:
            TaskRequest(**data)
        assert "status" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_short_title(self, task_queries):
        """Test title minimum length"""
        data = VALID_TASK_DATA.copy()
        data["title"] = "a" * 4
        
        with pytest.raises(ValidationError) as exc_info:
            TaskRequest(**data)
        assert "title" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_delete_already_deleted_task(self, task_queries):
        """Test deleting a task that doesn't exist"""
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        
        with patch.object(TaskQueries, 'delete_task', new_callable=AsyncMock) as mock_delete:
            mock_delete.side_effect = ValueError("Task not found")
            
            with pytest.raises(HTTPException) as exc_info:
                await delete_task(
                    task_id=str(ObjectId()),
                    current_user=current_user,
                    queries=task_queries
                )
            
            assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
            
    @pytest.mark.asyncio
    async def test_update_task_no_changes(self, task_queries):
        """Test updating task with same values"""
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        mock_task = get_mock_task(current_user.id)
        
        with patch.object(TaskQueries, 'update_task', new_callable=AsyncMock) as mock_update:
            mock_update.return_value = mock_task
            
            result = await update_task(
                task_id=str(mock_task.id),
                task=TaskRequest(**VALID_TASK_DATA),
                current_user=current_user,
                queries=task_queries
            )
            
            assert isinstance(result, TaskResponse)
            mock_update.assert_called_once()
