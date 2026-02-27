from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from ..database import get_db
from ..deps import get_current_user_id
from ..schemas import UserCreate, UserOut
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Schémas locaux ────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserCreate) -> TokenResponse:
    """Crée un compte porteur de projet et retourne un JWT."""
    async with get_db() as conn:
        if await conn.fetchrow("SELECT id FROM users WHERE email = $1", data.email):
            raise HTTPException(400, "Cet email est déjà utilisé.")

        user = await conn.fetchrow(
            """
            INSERT INTO users (email, name, phone, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            """,
            data.email,
            data.name,
            data.phone,
            hash_password(data.password),
        )

    return TokenResponse(access_token=create_access_token(str(user["id"])))


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest) -> TokenResponse:
    """Authentifie un utilisateur et retourne un JWT."""
    async with get_db() as conn:
        user = await conn.fetchrow(
            "SELECT id, password_hash FROM users WHERE email = $1",
            data.email,
        )

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect.")

    return TokenResponse(access_token=create_access_token(str(user["id"])))


@router.get("/me", response_model=UserOut)
async def get_me(user_id: UUID = Depends(get_current_user_id)) -> dict:
    """Retourne le profil de l'utilisateur connecté."""
    async with get_db() as conn:
        user = await conn.fetchrow(
            """
            SELECT id, email, name, phone, email_verified, created_at
            FROM users WHERE id = $1
            """,
            user_id,
        )

    if not user:
        raise HTTPException(404, "Utilisateur introuvable.")

    return dict(user)
