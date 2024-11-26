from models.users import UserRequest, UserResponse, User
from utils.database import engine


class UserQueries:
    
    async def create_user(self, user: UserRequest) -> User:
        user_model = User(
        username=user.username,
        email=user.email,
        password=user.password
    )
        await engine.save(user_model)
        return user_model