from odmantic import Model, Field
from typing import Optional
from pydantic import BaseModel


class UserRequest(BaseModel):
    """
    Represents the parameters needed to create a new user
    """
    username: str
    email: str
    password: str


class User(Model):
    """
    Main database model for users using ODMantic
    """
    username: str = Field(unique=True)
    email: str = Field(unique=True)
    password: str
    
    model_config = {
        "collection": "users"
    }


class UserResponse(BaseModel):
    """
    Represents a user, with the password not included
    """
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

class UserWithPw(BaseModel):
    """
    Represents a user with password included
    """
    id: str
    username: str
    password: str
    
    @classmethod
    def from_mongo(cls, user: User) -> "UserWithPw":
        """
        Convert from MongoDB model to full user model
        """
        return cls(
            id=str(user.id),
            username=user.username,
            password=user.password
        )