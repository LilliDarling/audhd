from models.users import UserRequest, User
from utils.database import engine
from typing import Optional


class UserQueries:
    
    async def create_user(self, user: UserRequest) -> User:
        user_model = User(
        username=user.username,
        name=user.name,
        email=user.email,
        password=user.password
        )
        await engine.save(user_model)
        return user_model
    
    async def get_by_id(self, user_id: str) -> Optional[User]:
        user_model = await engine.find_one(User, User.id == user_id)
        return user_model
    
    async def get_by_username(self, username: str) -> Optional[User]:
        user_model = await engine.find_one(User, User.username == username)
        return user_model
    
    async def update_password(self, username: str, new_password: str) -> None:
        user = await self.get_by_username(username)
        if user:
            user.password = new_password
            await engine.save(user)