import os
from pathlib import Path
from dotenv import load_dotenv

from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
from models.users import User
from models.tasks import Task
from models.calendar import GoogleCredentials
from models.assistant import AssistantMessage


env_path = Path('.') / '.env' / 'api.env'
load_dotenv(env_path)

client = AsyncIOMotorClient(os.environ["MONGO_DB_URI"])
engine = AIOEngine(client=client, database="audhd")


async def initialize_database():
    await engine.configure_database([User, Task, GoogleCredentials, AssistantMessage])