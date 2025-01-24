from pydantic import BaseModel


class JWTUserData(BaseModel):
    id: str
    username: str


class JWTPayload(BaseModel):
    user: JWTUserData
    sub: str
    exp: int
