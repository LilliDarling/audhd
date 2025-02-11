from fastapi import HTTPException, status
from typing import Optional
import structlog

logger = structlog.get_logger()

class AuthExceptions:
    @staticmethod
    def unauthorized(detail: str = "Not authenticated") -> HTTPException:
        logger.warning("unauthorized_access", detail=detail)
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )
    
    @staticmethod
    def invalid_credentials() -> HTTPException:
        logger.warning("invalid_credentials")
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

class UserExceptions:
    @staticmethod
    def not_found(detail: str = "User not found") -> HTTPException:
        logger.warning("user_not_found", detail=detail)
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )
    
    @staticmethod
    def invalid_format(field: str, detail: Optional[str] = None) -> HTTPException:
        logger.warning("invalid_format", field=field, detail=detail)
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail or f"Invalid {field} format"
        )
    
    @staticmethod
    def database_error(operation: str) -> HTTPException:
        logger.error("database_error", operation=operation)
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while {operation}"
        )
    
    @staticmethod
    def duplicate_field(field: str) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with this {field} already exists"
        )

class TaskExceptions:
    @staticmethod
    def not_found() -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

class CalendarExceptions:
    @staticmethod
    def not_connected() -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Calendar not connected. Please connect your Google Calendar first."
        )
    
    @staticmethod
    def credentials_expired() -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Calendar credentials expired"
        )
    
    @staticmethod
    def operation_failed(operation: str) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calendar operation failed: {operation}"
        )

def handle_database_operation(operation_name: str):
    """
    Decorator for handling common database operation errors
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except ValueError as e:
                logger.warning(
                    "validation_error",
                    operation=operation_name,
                    error=str(e)
                )
                raise UserExceptions.invalid_format("input", str(e))
            except Exception as e:
                logger.error(
                    "database_operation_failed",
                    operation=operation_name,
                    error=str(e)
                )
                raise UserExceptions.database_error(operation_name)
        return wrapper
    return decorator
