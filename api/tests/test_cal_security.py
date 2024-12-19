import pytest
from datetime import timedelta
from pydantic import ValidationError

from models.calendar import CalendarEventRequest
from tests.conftest import VALID_CALENDAR_EVENT_DATA

class TestCalendarSecurity:
    """Test suite for calendar security edge cases."""

    @pytest.mark.asyncio
    async def test_invalid_task_id_format(self):
        invalid_event_data = VALID_CALENDAR_EVENT_DATA.copy()
        invalid_event_data["task_id"] = "invalid_id"

        with pytest.raises(ValidationError) as exc_info:
            CalendarEventRequest(**invalid_event_data)
        
        error_msg = str(exc_info.value)
        assert "String should have at least 24 characters" in error_msg

    @pytest.mark.asyncio
    async def test_task_id_invalid_objectid(self):
        invalid_event_data = VALID_CALENDAR_EVENT_DATA.copy()
        invalid_event_data["task_id"] = "x" * 24

        with pytest.raises(ValidationError) as exc_info:
            CalendarEventRequest(**invalid_event_data)
        
        error_msg = str(exc_info.value)
        assert "Invalid MongoDB ObjectId format" in error_msg

    @pytest.mark.asyncio
    async def test_invalid_end_time(self):
        invalid_event_data = VALID_CALENDAR_EVENT_DATA.copy()
        invalid_event_data["end_time"] = invalid_event_data["start_time"] - timedelta(hours=1)

        with pytest.raises(ValidationError) as exc_info:
            CalendarEventRequest(**invalid_event_data)
        
        error_msg = str(exc_info.value)
        assert "end_time must be after start_time" in error_msg