import pytest
import jwt
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId
from datetime import UTC, datetime, timedelta

from models.users import User
from models.jwt import JWTPayload, JWTUserData
from models.tasks import Task
from utils.authentication import ALGORITHM, SIGNING_KEY, hash_password
from queries.auth import UserQueries
from queries.tasks import TaskQueries

VALID_USER_DATA = {
    "username": "testuser",
    "name": "Test User",
    "email": "test@example.com",
    "password": "StrongPass123!"
}

VALID_TASK_DATA = {
    "title": "Test Task",
    "description": "Test Description",
    "priority": 1,
    "status": "pending"
}

def get_mock_task(user_id: str, overrides=None):
    """Helper function to create a mock task"""
    data = VALID_TASK_DATA.copy()
    if overrides:
        data.update(overrides)
    return Task(
        id=ObjectId(),
        user_id=user_id,
        **data
    )

def get_mock_user(overrides=None):
    """Helper function to create a mock user"""
    data = VALID_USER_DATA.copy()
    if overrides:
        data.update(overrides)
    return User(
        id=ObjectId(),
        username=data["username"],
        name=data["name"],
        email=data["email"],
        password=hash_password(data["password"])
    )

class MockRequest:
    """Mock FastAPI request object"""
    def __init__(self):
        self.headers = {"origin": "http://localhost:8000"}

class MockResponse:
    """Mock FastAPI response object"""
    def __init__(self):
        self.cookies = {}
        self.status_code = 200
    
    def set_cookie(self, key, value, **kwargs):
        self.cookies[key] = value
    
    def delete_cookie(self, key, **kwargs):
        self.cookies.pop(key, None)

@pytest.fixture
async def mock_db():
    """Mock database with pre-configured responses"""
    mock = MagicMock()
    mock.find_one = AsyncMock()
    mock.save = AsyncMock()
    return mock

@pytest.fixture
async def mock_request():
    return MockRequest()

@pytest.fixture
async def mock_response():
    return MockResponse()

@pytest.fixture
def task_queries():
    """Create a TaskQueries instance for testing"""
    return TaskQueries()

@pytest.fixture
def queries():
    """Create a UserQueries instance for testing"""
    return UserQueries()

def create_token(mock_user: User, expired: bool = False) -> str:
    """Helper function to create JWT tokens for tests"""
    exp_time = int((datetime.now(tz=UTC) + timedelta(hours=-1 if expired else 1)).timestamp())
    payload = JWTPayload(
        exp=exp_time,
        sub=mock_user.username,
        user=JWTUserData(id=str(mock_user.id), username=mock_user.username)
    )
    return jwt.encode(payload.model_dump(), SIGNING_KEY, algorithm=ALGORITHM)