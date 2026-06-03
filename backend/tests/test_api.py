import os

os.environ["MONGODB_URI"] = "mongodb://localhost:27017"
os.environ["REQUIRE_MONGODB"] = "false"
os.environ["ADMIN_USERNAME"] = "test-admin"
os.environ["ADMIN_PASSWORD"] = "test-password"
os.environ["ADMIN_SESSION_SECRET"] = "test-admin-session-secret"

from fastapi.testclient import TestClient

from app.main import app


def test_shop_and_schedule_endpoints_return_seed_data() -> None:
    with TestClient(app) as client:
        shop = client.get("/api/shop")
        staff = client.get("/api/staff")
        schedule = client.get("/api/schedule")

    assert shop.status_code == 200
    assert shop.json()["name"] == "Instyle Massage"
    assert [location["id"] for location in shop.json()["locations"]] == ["wollongong"]
    assert len(shop.json()["price_menu"]) >= 5
    assert shop.json()["locations"][0]["hours"]["Monday"]
    assert shop.json()["locations"][0]["price_menu"] == shop.json()["price_menu"]
    assert staff.status_code == 200
    assert {member["branch_id"] for member in staff.json()} == {"wollongong"}
    assert schedule.status_code == 200
    assert len(schedule.json()["days"]) == 7
    assert {shift["branch_id"] for day in schedule.json()["days"] for shift in day["shifts"]} == {"wollongong"}


def test_admin_endpoints_require_login() -> None:
    with TestClient(app) as client:
        shop = client.get("/api/shop").json()
        blocked = client.put("/api/admin/shop", json=shop)
        bad_login = client.post("/api/admin/login", json={"username": "test-admin", "password": "wrong"})
        login = client.post("/api/admin/login", json={"username": "test-admin", "password": "test-password"})
        allowed = client.put(
            "/api/admin/shop",
            json=shop,
            headers={"Authorization": f"Bearer {login.json()['token']}"},
        )

    assert blocked.status_code == 401
    assert bad_login.status_code == 401
    assert login.status_code == 200
    assert allowed.status_code == 200


def test_staff_delete_allows_empty_schedule_days() -> None:
    with TestClient(app) as client:
        login = client.post("/api/admin/login", json={"username": "test-admin", "password": "test-password"})
        headers = {"Authorization": f"Bearer {login.json()['token']}"}

        for member in client.get("/api/staff").json():
            delete_response = client.delete(f"/api/admin/staff/{member['id']}", headers=headers)
            assert delete_response.status_code == 204

        schedule = client.get("/api/schedule")

    assert schedule.status_code == 200
    assert len(schedule.json()["days"]) == 7
    assert all(day["shifts"] == [] for day in schedule.json()["days"])


def test_staff_save_rejects_missing_required_details() -> None:
    with TestClient(app) as client:
        login = client.post("/api/admin/login", json={"username": "test-admin", "password": "test-password"})
        invalid_staff = {
            "id": "",
            "name": "",
            "role": "",
            "branch_id": "wollongong",
            "specialties": [],
            "bio": "",
            "years_experience": 0,
            "image_url": "",
        }
        response = client.post(
            "/api/admin/staff",
            json=invalid_staff,
            headers={"Authorization": f"Bearer {login.json()['token']}"},
        )

    assert response.status_code == 422
