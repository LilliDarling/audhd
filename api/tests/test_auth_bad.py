import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from models.users import UserRequest, SignInRequest
from routes.auth import signin, create_user
from queries.auth import UserQueries
from conftest import get_mock_user, VALID_USER_DATA

class TestAuthenticationBadPath:
    """Test suite for authentication failure scenarios."""

    @pytest.mark.asyncio
    async def test_signup_duplicate_username(
        self,
        mock_request,
        mock_response,
        queries
    ):
        user_request = UserRequest(**VALID_USER_DATA)
        
        with patch.object(UserQueries, 'create_user', new_callable=AsyncMock) as mock_create:
            mock_create.side_effect = DuplicateKeyError("duplicate key error collection: test.users index: username_1 dup key")
            
            with pytest.raises(HTTPException) as exc_info:
                await create_user(
                    user=user_request,
                    request=mock_request,
                    response=mock_response,
                    queries=queries
                )
            
            assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
            assert exc_info.value.detail == "User with this username already exists"
            mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_signin_invalid_username(
        self,
        mock_request,
        mock_response,
        queries
    ):
        with patch.object(UserQueries, 'get_by_username', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            
            signin_request = SignInRequest(
                username="nonexistent",
                password="anypassword"
            )
            
            with pytest.raises(HTTPException) as exc_info:
                await signin(
                    user_req=signin_request,
                    request=mock_request,
                    response=mock_response,
                    queries=queries
                )
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert exc_info.value.detail == "Incorrect username or password"
            mock_get.assert_called_once_with("nonexistent")

    @pytest.mark.asyncio
    async def test_signin_wrong_password(
        self,
        mock_request,
        mock_response,
        queries
    ):
        mock_user = get_mock_user()
        
        with patch.object(UserQueries, 'get_by_username', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_user
            
            signin_request = SignInRequest(
                username=VALID_USER_DATA["username"],
                password="wrongpassword"
            )
            
            with pytest.raises(HTTPException) as exc_info:
                await signin(
                    user_req=signin_request,
                    request=mock_request,
                    response=mock_response,
                    queries=queries
                )
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert exc_info.value.detail == "Incorrect username or password"
            mock_get.assert_called_once_with(VALID_USER_DATA["username"])

    @pytest.mark.asyncio
    async def test_duplicate_email(
        self,
        mock_request,
        mock_response,
        queries
    ):
        user_request = UserRequest(**VALID_USER_DATA)

        with patch.object(UserQueries, 'create_user', new_callable=AsyncMock) as mock_create:
            mock_create.side_effect = DuplicateKeyError("duplicate key error collection: test.users index: email_1 dup key")
            
            with pytest.raises(HTTPException) as exc_info:
                await create_user(
                    user=user_request,
                    request=mock_request,
                    response=mock_response,
                    queries=queries
                )
            
            assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
            assert exc_info.value.detail == "User with this email already exists"
            mock_create.assert_called_once()