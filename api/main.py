from fastapi import FastAPI
from routes import auth, tasks


api = FastAPI()

api.include_router(tasks.router, tags=["Tasks"])
api.include_router(auth.router, tags=["Authentication"])