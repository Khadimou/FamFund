from uuid import UUID

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from .security import ALGORITHM, SECRET_KEY

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UUID:
    """Dépendance FastAPI — extrait et valide le JWT, retourne l'UUID de l'utilisateur."""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalide.")
        return UUID(user_id)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token invalide ou expiré.")
