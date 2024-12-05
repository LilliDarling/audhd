from odmantic import Model, Field
from typing import Optional
from pydantic import BaseModel


class UserRequest(BaseModel):
    username: str
    name: str
    email: str
    password: str

class SignInRequest(BaseModel):
    username: str
    password: str

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
    current_password: str
    new_password: str