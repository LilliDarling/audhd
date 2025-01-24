import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException, status

from models.users import PasswordChangeRequest, UserRequest, SignInRequest, UserResponse
from routes.auth import change_password, signin, create_user, signout
from queries.auth import UserQueries
from conftest import get_mock_user, VALID_USER_DATA

class TestAuthenticationGoodPath:
    """Test suite for successful authentication flows."""
    
    @pytest.mark.asyncio
    async def test_successful_signup(
        self,
        mock_request,
        mock_response,
        queries
    ):
        mock_user = get_mock_user()
        
        with patch.object(UserQueries, 'create_user', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_user
            
            user_request = UserRequest(**VALID_USER_DATA)
            result = await create_user(
                user=user_request,
                request=mock_request,
                response=mock_response,
                queries=queries
            )
            
            assert result.username == VALID_USER_DATA["username"]
            assert "fast_api_token" in mock_response.cookies
            mock_create.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_successful_signin(
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
                password=VALID_USER_DATA["password"]
            )
            result = await signin(
                user_req=signin_request,
                request=mock_request,
                response=mock_response,
                queries=queries
            )
            
            assert result.username == VALID_USER_DATA["username"]
            assert "fast_api_token" in mock_response.cookies
            mock_get.assert_called_once()

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
                password="WrongPassword123!"
            )
            
            with pytest.raises(HTTPException) as exc_info:
                await signin(
                    user_req=signin_request,
                    request=mock_request,
                    response=mock_response,
                    queries=queries
                )
            
            assert exc_info.value.status_code == 401
            assert exc_info.value.detail == "Incorrect username or password"
            mock_get.assert_called_once()

    @pytest.mark.asyncio
    async def test_password_change_wrong_current_password(self, queries):
        mock_user = get_mock_user()
        current_user = UserResponse(
            id=str(mock_user.id),
            username=mock_user.username
        )
        
        with patch.object(UserQueries, 'get_by_username', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_user
            
            password_request = PasswordChangeRequest(
                current_password="WrongPassword123!",
                new_password="NewStrongPass456!"
            )
            
            with pytest.raises(HTTPException) as exc_info:
                await change_password(
                    password_change=password_request,
                    current_user=current_user,
                    queries=queries
                )
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert exc_info.value.detail == "Current password is incorrect"
            mock_get.assert_called_once_with(current_user.username)

    @pytest.mark.asyncio
    async def test_password_change_user_not_found(self, queries):
        mock_user = get_mock_user()
        current_user = UserResponse(
            id=str(mock_user.id),
            username=mock_user.username
        )
        
        with patch.object(UserQueries, 'get_by_username', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            
            password_request = PasswordChangeRequest(
                current_password=VALID_USER_DATA["password"],
                new_password="NewStrongPass456!"
            )
            
            with pytest.raises(HTTPException) as exc_info:
                await change_password(
                    password_change=password_request,
                    current_user=current_user,
                    queries=queries
                )
            
            assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
            assert exc_info.value.detail == "User not found"
            mock_get.assert_called_once_with(current_user.username)

    @pytest.mark.asyncio
    async def test_successful_signout(
        self,
        mock_request,
        mock_response
    ):
        mock_request.cookies = {"fast_api_token": "dummy-token"}
        
        result = await signout(
            response=mock_response,
            request=mock_request
        )
        
        assert result["message"] == "Signed out successfully"