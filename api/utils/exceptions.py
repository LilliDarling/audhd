from fastapi import HTTPException, status
from typing import Optional

class AuthExceptions:
    @staticmethod
    def unauthorized(detail: str = "Not authenticated") -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )
    
    @staticmethod
    def invalid_credentials() -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

class UserExceptions:
    @staticmethod
    def not_found(detail: str = "User not found") -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )
    
    @staticmethod
    def invalid_format(field: str, detail: Optional[str] = None) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail or f"Invalid {field} format"
        )
    
    @staticmethod
    def database_error(operation: str) -> HTTPException:
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
                raise UserExceptions.invalid_format("input", str(e))
            except HTTPException:
                raise
            except Exception as e:
                raise UserExceptions.database_error(operation_name)
        return wrapper
    return decorator