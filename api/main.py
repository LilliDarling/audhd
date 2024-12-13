from fastapi import FastAPI
from routes import auth, tasks, calendar


api = FastAPI()

api.include_router(tasks.router, tags=["Tasks"])
api.include_router(auth.router, tags=["Authentication"])
api.include_router(calendar.router, tags=["Calendar"])