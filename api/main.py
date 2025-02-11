from fastapi import FastAPI
from routes import auth, tasks, calendar
from fastapi.middleware.cors import CORSMiddleware
from middleware.logging import logging_middleware
from config.logging import setup_logging

setup_logging()

api = FastAPI()

api.middleware("http")(logging_middleware)

api.add_middleware(
    CORSMiddleware,
    allow_origins=[
      "http://localhost:8081",
      "http://127.0.0.1:8081",
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