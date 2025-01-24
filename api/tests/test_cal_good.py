import pytest
from unittest.mock import AsyncMock, patch, MagicMock, ANY, call

from models.calendar import CalendarEventRequest, CalendarEventResponse
from routes.calendar import handle_google_auth, add_task_to_calendar
from queries.calendar import CalendarQueries
from config.calendar_mgr import GoogleService
from conftest import MOCK_GOOGLE_TOKEN, VALID_CALENDAR_EVENT_DATA, get_mock_task

class TestCalendarGoodPath:
    """Test suite for successful calendar operations."""

    @pytest.mark.asyncio
    async def test_successful_google_auth(
        self,
        mock_user_with_calendar,
        calendar_queries
    ):
        user, _ = mock_user_with_calendar

        mock_service = MagicMock(spec=GoogleService)
        mock_service.encrypt_token = MagicMock(side_effect=lambda x: f"encrypted_{x}")
        
        with patch('routes.calendar.GoogleService', return_value=mock_service) as MockService:
            with patch.object(CalendarQueries, 'save_google_credentials', new_callable=AsyncMock) as mock_save:
                result = await handle_google_auth(
                    google_token=MOCK_GOOGLE_TOKEN,
                    current_user=user,
                    queries=calendar_queries
                )
                
                assert result["message"] == "Google Calendar connected successfully"
                
                expected_calls = [
                    call(MOCK_GOOGLE_TOKEN["access_token"]),
                    call(MOCK_GOOGLE_TOKEN["refresh_token"])
                ]
                mock_service.encrypt_token.assert_has_calls(expected_calls, any_order=True)
                assert mock_service.encrypt_token.call_count == 2

                mock_save.assert_called_once_with(
                    user_id=user.id,
                    access_token=f"encrypted_{MOCK_GOOGLE_TOKEN['access_token']}",
                    refresh_token=f"encrypted_{MOCK_GOOGLE_TOKEN['refresh_token']}",
                    expiry=ANY
                )

    @pytest.mark.asyncio
    async def test_successful_add_event(
        self,
        mock_user_with_calendar,
        calendar_queries,
        task_queries
    ):
        user, credentials = mock_user_with_calendar
        mock_task = get_mock_task(str(user.id))
        event_request = CalendarEventRequest(**VALID_CALENDAR_EVENT_DATA)

        mock_calendar_response = CalendarEventResponse(
            event_id="mock_event_123",
            task_id=str(mock_task.id),
            calendar_link="https://calendar.google.com/event/123"
        )

        with patch('queries.tasks.TaskQueries.get_task', new_callable=AsyncMock) as mock_get_task:
            with patch.object(CalendarQueries, 'add_event_to_calendar', new_callable=AsyncMock) as mock_add_event:
                mock_get_task.return_value = mock_task
                mock_add_event.return_value = mock_calendar_response

                result = await add_task_to_calendar(
                    event_request=event_request,
                    current_user=user,
                    calendar_queries=calendar_queries,
                    task_queries=task_queries
                )

                assert isinstance(result, CalendarEventResponse)
                assert result.event_id == "mock_event_123"
                assert result.task_id == str(mock_task.id)

                called_args = mock_get_task.call_args[0]
                assert called_args[0] == event_request.task_id
                assert called_args[1] == user.id

                mock_add_event.assert_called_once_with(
                    user.id,
                    mock_task,
                    event_request
                )