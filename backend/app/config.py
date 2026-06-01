from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_uri: str = Field(default="mongodb://localhost:27017", alias="MONGODB_URI")
    mongodb_db: str = Field(default="instyle_massage", alias="MONGODB_DB")
    api_cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="API_CORS_ORIGINS",
    )
    require_mongodb: bool = Field(default=False, alias="REQUIRE_MONGODB")
    admin_username: str = Field(default="admin", alias="ADMIN_USERNAME")
    admin_password: str = Field(default="change-me-before-launch", alias="ADMIN_PASSWORD")
    admin_session_secret: str = Field(
        default="replace-with-a-long-random-secret",
        alias="ADMIN_SESSION_SECRET",
    )

    model_config = SettingsConfigDict(
        env_file="backend/.env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.api_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
