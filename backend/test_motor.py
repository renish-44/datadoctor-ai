import asyncio
from app.database import client


async def test():
    try:
        await client.admin.command("ping")
        print("Motor MongoDB connection SUCCESSFUL")
    except Exception as e:
        print("MongoDB connection FAILED")
        print(e)
    finally:
        client.close()


asyncio.run(test())