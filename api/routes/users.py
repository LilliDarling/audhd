from fastapi import APIRouter, Depends
from models.users import UserRequest, User, UserResponse, UserWithPw
from queries.users import UserQueries


router = APIRouter()


@router.post("/users", response_model=UserResponse)
async def create_user(
    user: UserRequest,
    queries: UserQueries = Depends(),
):
    user_new = await queries.create_user(user=user)
    return UserResponse.from_mongo(user_new)