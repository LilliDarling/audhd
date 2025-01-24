import pytest
from pydantic import ValidationError
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException, status

from models.users import UserRequest, SignInRequest
from routes.auth import authenticate, signin, create_user
from utils.authentication import try_get_jwt_user_data
from queries.auth import UserQueries
from conftest import VALID_USER_DATA, get_mock_user, create_token

class TestAuthenticationUglyPath:
    """Test suite for security edge cases and potential attack vectors."""

    @pytest.mark.asyncio
    async def test_expired_jwt_token(self):
        mock_user = get_mock_user()
        token = create_token(mock_user, expired=True)
        
        user_data = await try_get_jwt_user_data(token)
        assert user_data is None

    @pytest.mark.asyncio
    async def test_malformed_jwt_token(self):
        user_data = await try_get_jwt_user_data("malformed.jwt.token")
        assert user_data is None

    @pytest.mark.asyncio
    async def test_sql_injection_attempt(
        self,
        mock_request,
        mock_response,
        queries
    ):
        with patch.object(UserQueries, 'get_by_username', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            
            signin_request = SignInRequest(
                username="'; DROP TABLE users; --",
                password="password123"
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
            mock_get.assert_called_once_with("'; DROP TABLE users; --")

    @pytest.mark.asyncio
    async def test_password_with_unicode(
        self,
        mock_request,
        mock_response,
        queries
    ):
        user_data = VALID_USER_DATA.copy()
        user_data["password"] = "Password123!🔒"
        
        user_request = UserRequest(**user_data)
        mock_user = get_mock_user(user_data)
        
        with patch.object(UserQueries, 'create_user', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_user

            result = await create_user(
                user=user_request,
                request=mock_request,
                response=mock_response,
                queries=queries
            )
            
            assert result.username == user_data["username"]
            assert "fast_api_token" in mock_response.cookies
            mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_extremely_long_password(
        self,
        mock_request,
        mock_response,
        queries
    ):
        user_data = VALID_USER_DATA.copy()
        user_data["password"] = "password!" * 9
        
        with pytest.raises(ValidationError) as exc_info: 
            user_request = UserRequest(**user_data)
            
            await create_user(
                user=user_request,
                request=mock_request,
                response=mock_response,
                queries=queries
            )
        
        assert "password" in str(exc_info.value).lower()
        assert "72" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_null_byte_injection(
        self,
        mock_request,
        mock_response,
        queries
    ):
        with patch.object(UserQueries, 'get_by_username', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            
            signin_request = SignInRequest(
                username="testuser\x00malicious",
                password="password123"
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
            mock_get.assert_called_once_with("testuser\x00malicious")

    @pytest.mark.asyncio
    async def test_authenticate_no_token(self):
        with pytest.raises(HTTPException) as exc_info:
            await authenticate(user=None)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Not authenticated"

    @pytest.mark.asyncio
    async def test_password_none_value(
        self,
        mock_request,
        mock_response,
        queries
    ):
        with pytest.raises(ValidationError) as exc_info:
            signin_request = SignInRequest(
                username="testuser",
                password=None 
            )
            
            await signin(
                user_req=signin_request,
                request=mock_request,
                response=mock_response,
                queries=queries
            )
        
        assert "password" in str(exc_info.value)