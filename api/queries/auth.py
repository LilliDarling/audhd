from utils.authentication import hash_password
from models.users import UserRequest, User
from utils.database import engine
from typing import Optional
from utils.exceptions import UserExceptions, handle_database_operation

class UserQueries:
    @handle_database_operation("checking existing user")
    async def check_existing_user(self, username: str, email: str) -> Optional[str]:
        existing_username = await engine.find_one(User, User.username == username)
        if existing_username:
            return "username"
        
        existing_email = await engine.find_one(User, User.email == email)
        if existing_email:
            return "email"
            
        return None
    
    @handle_database_operation("creating user")
    async def create_user(self, user: UserRequest) -> User:
        duplicate_field = await self.check_existing_user(
            username=user.username,
            email=user.email,
        )
        
        if duplicate_field:
            raise UserExceptions.duplicate_field(duplicate_field)
            
        user_model = User(
            username=user.username,
            name=user.name,
            email=user.email,
            password=user.password
        )
        await engine.save(user_model)
        return user_model
    
    @handle_database_operation("retrieving user")
    async def get_by_id(self, user_id: str) -> User:
        user_model = await engine.find_one(User, User.id == user_id)
        if not user_model:
            raise UserExceptions.not_found()
        return user_model
    
    @handle_database_operation("retrieving user")
    async def get_by_username(self, username: str) -> User:
        if not username or not isinstance(username, str):
            raise UserExceptions.invalid_format("username")
        
        user_model = await engine.find_one(User, User.username == username)
        if not user_model:
            raise UserExceptions.not_found()
        return user_model
    
    @handle_database_operation("updating password")
    async def update_password(self, username: str, new_password: str) -> None:
        if not new_password or len(new_password) < 8:
            raise UserExceptions.invalid_format(
                "password",
                "Invalid password format. Password must be at least 8 characters long"
            )

        user = await self.get_by_username(username)

        try:
            UserRequest(
                username=user.username,
                name=user.name,
                email=user.email,
                password=new_password
            )
        except ValueError as e:
            raise UserExceptions.invalid_format("password", str(e))

        user.password = hash_password(new_password)
        await engine.save(user)