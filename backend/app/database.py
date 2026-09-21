import certifi
import logging
import motor.motor_asyncio
from app.config import settings

logger = logging.getLogger("datadoctor.database")

# Configure client with a 5-second server selection timeout and trusted CA bundle
client = motor.motor_asyncio.AsyncIOMotorClient(
    settings.MONGODB_URL,
    serverSelectionTimeoutMS=5000,
    tlsCAFile=certifi.where(),
)
db = client[settings.MONGODB_DB_NAME]


users_collection = db["users"]
datasets_collection = db["datasets"]
audit_reports_collection = db["audit_reports"]
cleaning_jobs_collection = db["cleaning_jobs"]


async def check_db_connection() -> dict:
    """Test MongoDB connectivity safely without throwing unhandled exceptions."""
    try:
        await client.admin.command("ping")
        return {
            "status": "connected",
            "database": settings.MONGODB_DB_NAME,
            "message": "Successfully connected to MongoDB",
        }
    except Exception as e:
        return {
            "status": "disconnected",
            "database": settings.MONGODB_DB_NAME,
            "error": str(e),
            "message": "Could not connect to MongoDB. Check MONGODB_URL and Atlas cluster status.",
        }


async def init_db():
    try:
        await users_collection.create_index("email", unique=True)
        await datasets_collection.create_index("user_id")
        await audit_reports_collection.create_index("dataset_id")
        await cleaning_jobs_collection.create_index("dataset_id")
        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.error(f"Warning: Could not initialize MongoDB indexes: {e}")
        logger.error(
            "Please verify your MONGODB_URL in backend/.env (e.g. if MongoDB Atlas cluster is paused or IP is not whitelisted)."
        )


async def close_db():
    try:
        client.close()
    except Exception:
        pass


