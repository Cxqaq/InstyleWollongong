import base64
import hashlib
import hmac
import time

from fastapi import Header, HTTPException, status
from pydantic import BaseModel

from app.config import get_settings


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    token: str


def create_admin_token(username: str) -> str:
    expires_at = str(int(time.time()) + 60 * 60 * 12)
    payload = f"{username}:{expires_at}"
    signature = _sign(payload)
    token = f"{payload}:{signature}"
    return base64.urlsafe_b64encode(token.encode("utf-8")).decode("utf-8")


def require_admin(authorization: str | None = Header(default=None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise _unauthorized()
    token = authorization.removeprefix("Bearer ").strip()
    if not _verify_admin_token(token):
        raise _unauthorized()


def verify_admin_credentials(username: str, password: str) -> bool:
    settings = get_settings()
    return secrets_equal(username, settings.admin_username) and secrets_equal(password, settings.admin_password)


def secrets_equal(left: str, right: str) -> bool:
    return hmac.compare_digest(left.encode("utf-8"), right.encode("utf-8"))


def _verify_admin_token(encoded_token: str) -> bool:
    try:
        decoded = base64.urlsafe_b64decode(encoded_token.encode("utf-8")).decode("utf-8")
        username, expires_at, signature = decoded.rsplit(":", 2)
        payload = f"{username}:{expires_at}"
        if not secrets_equal(signature, _sign(payload)):
            return False
        if int(expires_at) < int(time.time()):
            return False
        return secrets_equal(username, get_settings().admin_username)
    except (ValueError, TypeError):
        return False


def _sign(payload: str) -> str:
    secret = get_settings().admin_session_secret.encode("utf-8")
    return hmac.new(secret, payload.encode("utf-8"), hashlib.sha256).hexdigest()


def _unauthorized() -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin sign in required")
