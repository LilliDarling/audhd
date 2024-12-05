from fastapi import (
    Depends,
    Request,
    Response,
    HTTPException,
    status,
    APIRouter,
)
from utils.authentication import (
    try_get_jwt_user_data,
    hash_password,
    generate_jwt,
    verify_password,
)
from utils.database import engine
from models.users import UserRequest, UserResponse, SignInRequest, PasswordChangeRequest
from queries.auth import UserQueries


router = APIRouter(tags=["Authentication"], prefix="/api/auth")


@router.post("/signup")
async def create_user(
    user: UserRequest,
    request: Request,
    response: Response,
    queries: UserQueries = Depends(),
) -> UserResponse:
    
    hashed_password = hash_password(user.password)
    user_data = user.model_dump()

    user_data["password"] = hashed_password

    user_new = await queries.create_user(UserRequest(**user_data))

    token = generate_jwt(user_new)
    secure = False if request.headers.get("origin", "").startswith("http://localhost") else True
    response.set_cookie(
        key="fast_api_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=secure,
    )
    return UserResponse.from_mongo(user_new)


@router.post("/signin")
async def signin(
    user_req: SignInRequest,
    request: Request,
    response: Response,
    queries: UserQueries = Depends(),
) -> UserResponse:
    
    user = await queries.get_by_username(user_req.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    if not verify_password(user_req.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    token = generate_jwt(user)
    secure = False if request.headers.get("origin", "").startswith("http://localhost") else True
    response.set_cookie(
        key="fast_api_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=secure,
    )

    return UserResponse.from_mongo(user)


@router.get("/authenticate")
async def authenticate(
    user: UserResponse = Depends(try_get_jwt_user_data),
) -> UserResponse | None:
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return user


@router.put("/change-password")
async def change_password(
    password_change: PasswordChangeRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: UserQueries = Depends(),
) -> dict:
    
    user = await queries.get_by_username(current_user.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not verify_password(password_change.current_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    new_hashed_password = hash_password(password_change.new_password)
    
    user.password = new_hashed_password
    await engine.save(user)
    
    return {"message": "Password updated successfully"}


@router.delete("/signout")
async def signout(
    request: Request,
    response: Response,
):
    secure = False if request.headers.get("origin", "").startswith("http://localhost") else True
    response.delete_cookie(
        key="fast_api_token",
        httponly=True,
        samesite="lax",
        secure=secure
    )
    return {"message": "Signed out successfully"}