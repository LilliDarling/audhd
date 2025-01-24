import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException

from models.calendar import CalendarEventRequest
from routes.calendar import handle_google_auth, add_task_to_calendar
from conftest import MOCK_GOOGLE_TOKEN, VALID_CALENDAR_EVENT_DATA

class TestCalendarBadPath:
    """Test suite for calendar operation failure scenarios."""

    @pytest.mark.asyncio
    async def test_google_auth_no_user(
        self,
        calendar_queries
    ):
        with pytest.raises(HTTPException) as exc_info:
            await handle_google_auth(
                google_token=MOCK_GOOGLE_TOKEN,
                current_user=None,
                queries=calendar_queries
            )
        
        assert exc_info.value.status_code == 401
        assert "Not authenticated" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_add_event_nonexistent_task(
        self,
        mock_user_with_calendar,
        calendar_queries,
        task_queries
    ):
        user, _ = mock_user_with_calendar
        event_request = CalendarEventRequest(**VALID_CALENDAR_EVENT_DATA)

        with patch('queries.tasks.TaskQueries.get_task', new_callable=AsyncMock) as mock_get_task:
            mock_get_task.return_value = None

            with pytest.raises(HTTPException) as exc_info:
                await add_task_to_calendar(
                    event_request=event_request,
                    current_user=user,
                    calendar_queries=calendar_queries,
                    task_queries=task_queries
                )

            assert exc_info.value.status_code == 404
            assert "Task not found" in exc_info.value.detail