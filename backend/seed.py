import asyncio
from pathlib import Path
import sys

from motor.motor_asyncio import AsyncIOMotorClient

sys.path.append(str(Path(__file__).resolve().parent))

from app.config import get_settings  # noqa: E402
from app.sample_data import SCHEDULE, SHOP, STAFF  # noqa: E402


async def seed() -> None:
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db]

    await db.shop_info.delete_many({})
    await db.staff.delete_many({})
    await db.weekly_schedules.delete_many({})

    await db.shop_info.insert_one({"slug": "instyle-massage", **SHOP.model_dump()})
    await db.staff.insert_many([member.model_dump() for member in STAFF])
    await db.weekly_schedules.insert_one(SCHEDULE.model_dump())

    await db.staff.create_index("id", unique=True)
    await db.weekly_schedules.create_index("week_start")
    client.close()
    print(f"Seeded {settings.mongodb_db} with shop info, {len(STAFF)} staff, and 1 weekly schedule.")


if __name__ == "__main__":
    asyncio.run(seed())
