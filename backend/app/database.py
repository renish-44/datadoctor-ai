import motor.motor_asyncio
from app.config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.MONGODB_DB_NAME]

users_collection = db["users"]
datasets_collection = db["datasets"]
audit_reports_collection = db["audit_reports"]
cleaning_jobs_collection = db["cleaning_jobs"]


async def init_db():
    await users_collection.create_index("email", unique=True)
    await datasets_collection.create_index("user_id")
    await audit_reports_collection.create_index("dataset_id")
    await cleaning_jobs_collection.create_index("dataset_id")


async def close_db():
    client.close()
