import hashlib
import os
import secrets
from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production-use-openssl-rand-hex-32")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def generate_invite_token() -> tuple[str, str]:
    """Retourne (token_clair, sha256_hash). Seul le hash est stocké en base."""
    plain = secrets.token_urlsafe(32)
    hashed = hashlib.sha256(plain.encode()).hexdigest()
    return plain, hashed


def hash_token(plain: str) -> str:
    return hashlib.sha256(plain.encode()).hexdigest()
