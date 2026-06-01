from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConfigurationError, PyMongoError, ServerSelectionTimeoutError

from app.auth import AdminLoginRequest, AdminLoginResponse, create_admin_token, require_admin, verify_admin_credentials
from app.config import get_settings
from app.repository import DemoRepository, MassageRepository, MongoMassageRepository, RepositoryError
from app.schemas import ShopInfo, StaffMember, WeeklySchedule


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    client = None
    try:
        client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=1200)
        await client.admin.command("ping")
        app.state.repository = MongoMassageRepository(client[settings.mongodb_db])
        app.state.data_source = "mongodb"
    except (ConfigurationError, ServerSelectionTimeoutError):
        if settings.require_mongodb:
            raise
        app.state.repository = DemoRepository()
        app.state.data_source = "demo"
    app.state.mongo_client = client
    yield
    if client is not None:
        client.close()


app = FastAPI(
    title="Instyle Massage API",
    version="0.1.0",
    description="Customer-facing API for shop information, staff profiles, and weekly schedules.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_repository(request: Request) -> MassageRepository:
    return request.app.state.repository


@app.get("/api/health")
async def health(request: Request) -> dict[str, str]:
    return {"status": "ok", "data_source": request.app.state.data_source}


@app.get("/api/shop", response_model=ShopInfo)
async def shop_details(repository: MassageRepository = Depends(get_repository)) -> ShopInfo:
    try:
        return await repository.get_shop()
    except (RepositoryError, PyMongoError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.get("/api/contact")
async def contact_details(repository: MassageRepository = Depends(get_repository)) -> dict:
    try:
        return await repository.get_contact()
    except (RepositoryError, PyMongoError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.get("/api/staff", response_model=list[StaffMember])
async def staff_list(repository: MassageRepository = Depends(get_repository)) -> list[StaffMember]:
    try:
        return await repository.get_staff()
    except (RepositoryError, PyMongoError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.get("/api/schedule", response_model=WeeklySchedule)
async def weekly_schedule(repository: MassageRepository = Depends(get_repository)) -> WeeklySchedule:
    try:
        return await repository.get_schedule()
    except (RepositoryError, PyMongoError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.post("/api/admin/login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLoginRequest) -> AdminLoginResponse:
    if not verify_admin_credentials(credentials.username, credentials.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    return AdminLoginResponse(token=create_admin_token(credentials.username))


@app.put("/api/admin/shop", response_model=ShopInfo)
async def update_shop(
    shop: ShopInfo,
    _: None = Depends(require_admin),
    repository: MassageRepository = Depends(get_repository),
) -> ShopInfo:
    try:
        return await repository.save_shop(shop)
    except (RepositoryError, PyMongoError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.post("/api/admin/staff", response_model=StaffMember)
async def upsert_staff(
    staff_member: StaffMember,
    _: None = Depends(require_admin),
    repository: MassageRepository = Depends(get_repository),
) -> StaffMember:
    try:
        return await repository.save_staff_member(staff_member)
    except (RepositoryError, PyMongoError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.delete("/api/admin/staff/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    staff_id: str,
    _: None = Depends(require_admin),
    repository: MassageRepository = Depends(get_repository),
) -> None:
    try:
        await repository.delete_staff_member(staff_id)
    except (RepositoryError, PyMongoError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.put("/api/admin/schedule", response_model=WeeklySchedule)
async def update_schedule(
    schedule: WeeklySchedule,
    _: None = Depends(require_admin),
    repository: MassageRepository = Depends(get_repository),
) -> WeeklySchedule:
    try:
        return await repository.save_schedule(schedule)
    except (RepositoryError, PyMongoError) as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
