from odmantic import Model, Field
from pydantic import BaseModel, Field as PydanticField, field_validator
import re

class UserRequest(BaseModel):
    username: str = PydanticField(min_length=5, max_length=30)
    name: str = PydanticField(min_length=2, max_length=30)
    email: str = PydanticField(pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    password: str = PydanticField(min_length=8, max_length=72)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        return v

class SignInRequest(BaseModel):
    username: str = PydanticField(min_length=5, max_length=30)
    password: str = PydanticField(min_length=8, max_length=72)

class User(Model):
    username: str = Field(unique=True)
    name: str
    email: str = Field(unique=True)
    password: str 
    
    model_config = {
        "collection": "users"
    }

class UserResponse(BaseModel):
    id: str
    username: str
    
    @classmethod
    def from_mongo(cls, user: User) -> "UserResponse":
        """
        Convert from MongoDB model to response model
        """
        return cls(
            id=str(user.id),
            username=user.username
        )

class PasswordChangeRequest(BaseModel):
    current_password: str = PydanticField(min_length=8, max_length=72)
    new_password: str = PydanticField(min_length=8, max_length=72)

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        return v
