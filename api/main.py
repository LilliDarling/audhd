from fastapi import FastAPI
from routes import auth


api = FastAPI()


api.include_router(auth.router, tags=["Authentication"])