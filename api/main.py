from fastapi import FastAPI
import logging
from routes import auth, tasks, calendar, assistant
from fastapi.middleware.cors import CORSMiddleware

logging.getLogger("pymongo.topology").setLevel(logging.WARNING)
logging.getLogger("pymongo.connection").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("pymongo.serverSelection").setLevel(logging.WARNING)
logging.getLogger("pymongo.command").setLevel(logging.WARNING)

api = FastAPI()

api.add_middleware(
    CORSMiddleware,
    allow_origins=[
      "http://localhost:8082",
      "http://127.0.0.1:8082",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

api.include_router(tasks.router, tags=["Tasks"])
api.include_router(auth.router, tags=["Authentication"])
api.include_router(calendar.router, tags=["Calendar"])
api.include_router(assistant.router, tags=["ADHDAssistant"])