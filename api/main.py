from fastapi import FastAPI
from routes import auth, tasks, calendar, assistant


api = FastAPI()

api.include_router(tasks.router, tags=["Tasks"])
api.include_router(auth.router, tags=["Authentication"])
api.include_router(calendar.router, tags=["Calendar"])
api.include_router(assistant.router, tags=["Assistant"])