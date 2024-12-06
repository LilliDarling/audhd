from fastapi import (
    Depends,
    Request,
    Response,
    HTTPException,
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
from utils.exceptions import AuthExceptions, UserExceptions, handle_route


router = APIRouter(tags=["Authentication"], prefix="/api/auth")

@router.post("/signup")
@handle_route("creating user")
async def create_user(
    user: UserRequest,
    request: Request,
    response: Response,
    queries: UserQueries = Depends(),
) -> UserResponse:
    hashed_password = hash_password(user.password)
    user_new = await queries.create_user(UserRequest(
        username=user.username,
        name=user.name,
        email=user.email,
        password=hashed_password
    ))

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
@handle_route("signing in")
async def signin(
    user_req: SignInRequest,
    request: Request,
    response: Response,
    queries: UserQueries = Depends(),
) -> UserResponse:
    try:
        user = await queries.get_by_username(user_req.username)
        
        if not user or not verify_password(user_req.password, user.password):
            raise AuthExceptions.invalid_credentials()
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        raise AuthExceptions.invalid_credentials()

@router.get("/authenticate")
@handle_route("authenticating")
async def authenticate(
    user: UserResponse = Depends(try_get_jwt_user_data),
) -> UserResponse:
    if not user:
        raise AuthExceptions.unauthorized()
    return user

@router.put("/change-password")
@handle_route("changing password")
async def change_password(
    password_change: PasswordChangeRequest,
    current_user: UserResponse = Depends(try_get_jwt_user_data),
    queries: UserQueries = Depends(),
) -> dict:
    if not current_user:
        raise AuthExceptions.unauthorized()
    
    user = await queries.get_by_username(current_user.username)
    if not user:
        raise UserExceptions.not_found()
    
    if not verify_password(password_change.current_password, user.password):
        raise AuthExceptions.unauthorized("Current password is incorrect")
    
    new_hashed_password = hash_password(password_change.new_password)
    user.password = new_hashed_password
    await engine.save(user)
    
    return {"message": "Password updated successfully"}

@router.delete("/signout")
@handle_route("signing out")
async def signout(
    request: Request,
    response: Response,
) -> dict:
    secure = False if request.headers.get("origin", "").startswith("http://localhost") else True
    response.delete_cookie(
        key="fast_api_token",
        httponly=True,
        samesite="lax",
        secure=secure
    )
    return {"message": "Signed out successfully"}