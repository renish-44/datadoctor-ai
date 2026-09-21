import asyncio
import re
from app.config import settings
from app.database import client, check_db_connection


def mask_mongo_uri(uri: str) -> str:
    """Mask username and password in MongoDB URI for safe printing."""
    return re.sub(r"://([^:]+):([^@]+)@", r"://\1:******@", uri)


async def test():
    masked_url = mask_mongo_uri(settings.MONGODB_URL)
    print(f"Testing MongoDB connection to: {masked_url}")
    print(f"Target Database: {settings.MONGODB_DB_NAME}")
    print("-" * 50)
    
    result = await check_db_connection()
    if result["status"] == "connected":
        print("SUCCESS: Connected to MongoDB successfully!")
    else:
        print("FAILURE: Could not connect to MongoDB.")
        print(f"Error details: {result.get('error')}")
        print("-" * 50)
        print("Troubleshooting steps:")
        print("1. If using MongoDB Atlas, check if your cluster is PAUSED at https://cloud.mongodb.com")
        print("2. In Atlas -> Network Access, ensure your current IP or '0.0.0.0/0' is allowed.")
        print("3. Check Database Access in Atlas to confirm the username and password are correct.")
        print("4. Update MONGODB_URL in backend/.env with your active cluster connection string.")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(test())