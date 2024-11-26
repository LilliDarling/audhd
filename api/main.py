from fastapi import FastAPI
from routes import users


app = FastAPI()


app.include_router(users.router, tags=["User"])