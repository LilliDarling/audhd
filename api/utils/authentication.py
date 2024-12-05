import os
import bcrypt
from calendar import timegm
from datetime import datetime, timedelta, timezone
from fastapi import Cookie
from jose import JWTError, jwt
from jose.constants import ALGORITHMS
from typing import Annotated, Optional
from models.jwt import JWTPayload, JWTUserData
from models.users import User

ALGORITHM = ALGORITHMS.HS256

SIGNING_KEY = os.environ.get("SIGNING_KEY")
if not SIGNING_KEY:
    raise ValueError("SIGNING_KEY environment variable not set")


async def decode_jwt(token: str) -> Optional[JWTPayload]:
    try:
        payload = jwt.decode(token, SIGNING_KEY, algorithms=[ALGORITHM])
        return JWTPayload(**payload)
    except (JWTError, AttributeError) as e:
        print(e)
    return None


async def try_get_jwt_user_data(
    fast_api_token: Annotated[str | None, Cookie()] = None,
) -> Optional[JWTUserData]:
    if not fast_api_token:
        return

    payload = await decode_jwt(fast_api_token)
    if not payload:
        return

    return payload.user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(
        plain_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode()


def generate_jwt(user: User) -> str:
    exp = int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp())
    jwt_data = JWTPayload(
        exp=exp,
        sub=user.username,
        user=JWTUserData(username=user.username, id=str(user.id)),
    )
    encoded_jwt = jwt.encode(
        jwt_data.model_dump(),
        SIGNING_KEY,
        algorithm=ALGORITHMS.HS256
    )
    return encoded_jwt
