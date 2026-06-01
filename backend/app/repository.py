from abc import ABC, abstractmethod
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.sample_data import SCHEDULE, SHOP, STAFF
from app.schemas import ShopInfo, StaffMember, WeeklySchedule


class RepositoryError(RuntimeError):
    pass


class MassageRepository(ABC):
    @abstractmethod
    async def get_shop(self) -> ShopInfo:
        raise NotImplementedError

    @abstractmethod
    async def get_contact(self) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def get_staff(self) -> list[StaffMember]:
        raise NotImplementedError

    @abstractmethod
    async def get_schedule(self) -> WeeklySchedule:
        raise NotImplementedError

    @abstractmethod
    async def save_shop(self, shop: ShopInfo) -> ShopInfo:
        raise NotImplementedError

    @abstractmethod
    async def save_staff_member(self, staff_member: StaffMember) -> StaffMember:
        raise NotImplementedError

    @abstractmethod
    async def delete_staff_member(self, staff_id: str) -> None:
        raise NotImplementedError

    @abstractmethod
    async def save_schedule(self, schedule: WeeklySchedule) -> WeeklySchedule:
        raise NotImplementedError


class DemoRepository(MassageRepository):
    def __init__(self) -> None:
        self.shop = SHOP
        self.staff = list(STAFF)
        self.schedule = SCHEDULE

    async def get_shop(self) -> ShopInfo:
        return self.shop

    async def get_contact(self) -> dict[str, Any]:
        return {"contact": self.shop.contact.model_dump(), "locations": [location.model_dump() for location in self.shop.locations]}

    async def get_staff(self) -> list[StaffMember]:
        return self.staff

    async def get_schedule(self) -> WeeklySchedule:
        return self.schedule

    async def save_shop(self, shop: ShopInfo) -> ShopInfo:
        self.shop = shop
        return self.shop

    async def save_staff_member(self, staff_member: StaffMember) -> StaffMember:
        self.staff = [member for member in self.staff if member.id != staff_member.id]
        self.staff.append(staff_member)
        self.staff.sort(key=lambda member: member.name)
        return staff_member

    async def delete_staff_member(self, staff_id: str) -> None:
        self.staff = [member for member in self.staff if member.id != staff_id]
        self.schedule = WeeklySchedule(
            week_start=self.schedule.week_start,
            days=[
                day.model_copy(update={"shifts": [shift for shift in day.shifts if shift.staff_id != staff_id]})
                for day in self.schedule.days
            ],
        )

    async def save_schedule(self, schedule: WeeklySchedule) -> WeeklySchedule:
        self.schedule = schedule
        return self.schedule


class MongoMassageRepository(MassageRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_shop(self) -> ShopInfo:
        document = await self.db.shop_info.find_one({"slug": "instyle-massage"}, {"_id": 0, "slug": 0})
        if not document:
            raise RepositoryError("shop information has not been seeded")
        return ShopInfo.model_validate(document)

    async def get_contact(self) -> dict[str, Any]:
        shop = await self.get_shop()
        return {"contact": shop.contact.model_dump(), "locations": [location.model_dump() for location in shop.locations]}

    async def get_staff(self) -> list[StaffMember]:
        cursor = self.db.staff.find({}, {"_id": 0}).sort("name", 1)
        return [StaffMember.model_validate(document) async for document in cursor]

    async def get_schedule(self) -> WeeklySchedule:
        document = await self.db.weekly_schedules.find_one({}, {"_id": 0}, sort=[("week_start", -1)])
        if not document:
            raise RepositoryError("weekly schedule has not been seeded")
        return WeeklySchedule.model_validate(document)

    async def save_shop(self, shop: ShopInfo) -> ShopInfo:
        await self.db.shop_info.replace_one(
            {"slug": "instyle-massage"},
            {"slug": "instyle-massage", **shop.model_dump()},
            upsert=True,
        )
        return shop

    async def save_staff_member(self, staff_member: StaffMember) -> StaffMember:
        await self.db.staff.replace_one({"id": staff_member.id}, staff_member.model_dump(), upsert=True)
        return staff_member

    async def delete_staff_member(self, staff_id: str) -> None:
        await self.db.staff.delete_one({"id": staff_id})
        await self.db.weekly_schedules.update_many({}, {"$pull": {"days.$[].shifts": {"staff_id": staff_id}}})

    async def save_schedule(self, schedule: WeeklySchedule) -> WeeklySchedule:
        await self.db.weekly_schedules.replace_one({"week_start": schedule.week_start}, schedule.model_dump(), upsert=True)
        return schedule
