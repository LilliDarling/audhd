from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
from models.users import User
import os


client = AsyncIOMotorClient(os.environ["MONGO_DB_URI"])
engine = AIOEngine(client=client, database="audhd")


async def initialize_database():
    await engine.configure_database([User])