from fastapi import FastAPI
from routes import auth, tasks, calendar, assistant
from fastapi.middleware.cors import CORSMiddleware


api = FastAPI()

api.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8082"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api.include_router(tasks.router, tags=["Tasks"])
api.include_router(auth.router, tags=["Authentication"])
api.include_router(calendar.router, tags=["Calendar"])
api.include_router(assistant.router, tags=["ADHDAssistant"])