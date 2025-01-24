import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException, status
from pydantic import ValidationError
from bson import ObjectId

from conftest import get_mock_user, get_mock_task, VALID_TASK_DATA
from models.tasks import TaskRequest, TaskResponse
from models.users import UserResponse
from queries.tasks import TaskQueries
from routes.tasks import create_task, get_task, update_task


class TestTasksSecurityPath:
    """Test suite for task-related security scenarios."""

    @pytest.mark.asyncio
    async def test_access_other_user_task(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)
        task_id = str(ObjectId())

        with patch.object(TaskQueries, 'get_task', new_callable=AsyncMock) as mock_get:
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
    async def test_invalid_task_id_format(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)

        with patch('bson.ObjectId', side_effect=Exception("Invalid ObjectId")):
            with pytest.raises(HTTPException) as exc_info:
                await get_task(
                    task_id="invalid-object-id",
                    current_user=current_user,
                    queries=task_queries
                )

            assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
            assert "invalid" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_xss_in_task_title(self, task_queries):
        mock_user = get_mock_user()
        current_user = UserResponse(id=str(mock_user.id), username=mock_user.username)

        xss_data = VALID_TASK_DATA.copy()
        xss_data["title"] = "<script>alert('xss')</script>"

        with patch.object(TaskQueries, 'create_task', new_callable=AsyncMock) as mock_create:
            task_request = TaskRequest(**xss_data)
            mock_task = get_mock_task(current_user.id, xss_data)
            mock_create.return_value = mock_task

            result = await create_task(
                task=task_request,
                current_user=current_user,
                queries=task_queries
            )

            mock_create.assert_called_once_with(task_request, current_user.id)
            
            assert result.title == xss_data["title"]

    @pytest.mark.asyncio
    async def test_extremely_long_description(self):
        """Test that long descriptions are properly rejected"""
        long_data = {
            "title": "Valid Title",
            "description": "x" * 101,
            "priority": 1
        }
        
        with pytest.raises(ValidationError) as exc_info:
            TaskRequest(**long_data)
        
        error_str = str(exc_info.value)
        assert "description" in error_str
        assert "at most 100 characters" in error_str.lower()
    
    @pytest.mark.asyncio
    async def test_unauthorized_task_access(self, task_queries):
        """Test accessing task without authentication"""
        with pytest.raises(HTTPException) as exc_info:
            await get_task(
                task_id=str(ObjectId()),
                current_user=None,
                queries=task_queries
            )
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    
    @pytest.mark.asyncio
    async def test_wrong_user_task_access(self, task_queries):
        """Test accessing task belonging to another user"""
        mock_user = get_mock_user()
        other_user_id = str(ObjectId())
        task = get_mock_task(other_user_id)
        
        with patch.object(TaskQueries, 'get_task', new_callable=AsyncMock) as mock_get:
            mock_get.side_effect = ValueError("Task not found")
            
            with pytest.raises(HTTPException) as exc_info:
                await get_task(
                    task_id=str(task.id),
                    current_user=UserResponse(id=str(mock_user.id), username=mock_user.username),
                    queries=task_queries
                )
            
            assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND

