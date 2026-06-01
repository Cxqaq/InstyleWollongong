from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class ContactInfo(BaseModel):
    phone: str = Field(min_length=7)
    email: EmailStr


class PriceMenuItem(BaseModel):
    name: str
    duration: str
    price: str
    description: str


class BranchLocation(BaseModel):
    id: str
    name: str
    address: str = Field(min_length=4)
    suburb: str
    state: str
    postcode: str
    map_url: str
    hours: dict[str, str] = Field(default_factory=dict)
    price_menu: list[PriceMenuItem] = Field(default_factory=list)


class ShopInfo(BaseModel):
    name: str
    tagline: str
    introduction: str
    hours: dict[str, str]
    services: list[str]
    contact: ContactInfo
    locations: list[BranchLocation]
    price_menu: list[PriceMenuItem]

    @model_validator(mode="after")
    def fill_branch_defaults(self) -> "ShopInfo":
        for location in self.locations:
            if not location.hours:
                location.hours = dict(self.hours)
            if not location.price_menu:
                location.price_menu = list(self.price_menu)
        return self


class StaffMember(BaseModel):
    id: str
    name: str
    role: str
    branch_id: str
    specialties: list[str]
    bio: str
    years_experience: int = Field(ge=0)
    image_url: str


class Shift(BaseModel):
    staff_id: str
    branch_id: str
    start: str = Field(pattern=r"^\d{2}:\d{2}$")
    end: str = Field(pattern=r"^\d{2}:\d{2}$")
    room: str


class DaySchedule(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    day: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    shifts: list[Shift]

    @field_validator("shifts")
    @classmethod
    def require_at_least_one_shift(cls, value: list[Shift]) -> list[Shift]:
        if not value:
            raise ValueError("each schedule day needs at least one shift")
        return value


class WeeklySchedule(BaseModel):
    week_start: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    days: list[DaySchedule]
