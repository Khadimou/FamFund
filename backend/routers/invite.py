from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..database import get_db
from ..schemas import PledgeType
from ..security import create_access_token, hash_password, hash_token

router = APIRouter(prefix="/invite", tags=["invite"])


# ── Schéma d'acceptation ──────────────────────────────────────────────────────

class AcceptInviteRequest(BaseModel):
    name:            str
    password:        str
    amount:          Decimal
    type:            PledgeType = PledgeType.loan
    interest_rate:   Optional[Decimal] = None
    duration_months: Optional[int]     = None
    notes:           Optional[str]     = None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/{token}")
async def get_invite_info(token: str) -> dict:
    """
    Valide le token d'invitation et retourne les informations publiques du groupe.
    Utilisé par la page /invite/[token] côté Next.js pour afficher le contexte.
    """
    token_hash = hash_token(token)

    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            SELECT
                it.email,
                it.name        AS invited_name,
                it.expires_at,
                it.used_at,
                fg.name        AS group_name,
                fg.goal_amount,
                fg.currency
            FROM invitation_tokens it
            JOIN family_groups fg ON fg.id = it.group_id
            WHERE it.token_hash = $1
            """,
            token_hash,
        )

    if not row:
        raise HTTPException(404, "Invitation introuvable ou lien invalide.")

    return {
        "token":        token,
        "group_name":   row["group_name"],
        "invited_name": row["invited_name"],
        "goal_amount":  float(row["goal_amount"]),
        "currency":     row["currency"],
        "expired":      row["expires_at"] < datetime.utcnow(),
        "already_used": row["used_at"] is not None,
    }


@router.post("/{token}")
async def accept_invite(token: str, data: AcceptInviteRequest) -> dict:
    """
    Accepte l'invitation :
    1. Valide le token (non expiré, non utilisé)
    2. Crée le compte utilisateur (ou réutilise le compte existant)
    3. Lie l'utilisateur au group_member
    4. Crée l'engagement (pledge) avec statut 'confirmed'
    5. Marque le token comme utilisé
    6. Retourne un JWT → connexion automatique côté Next.js
    """
    token_hash = hash_token(token)

    async with get_db() as conn:
        inv = await conn.fetchrow(
            """
            SELECT
                it.id              AS token_id,
                it.email,
                it.group_id,
                it.group_member_id,
                it.expires_at,
                it.used_at
            FROM invitation_tokens it
            WHERE it.token_hash = $1
            """,
            token_hash,
        )

        if not inv:
            raise HTTPException(404, "Invitation introuvable ou lien invalide.")
        if inv["used_at"] is not None:
            raise HTTPException(409, "Cette invitation a déjà été utilisée.")
        if inv["expires_at"] < datetime.utcnow():
            raise HTTPException(410, "Ce lien d'invitation a expiré. Demandez un nouveau lien.")

        async with conn.transaction():
            # ── 1. Compte utilisateur ─────────────────────────────────────
            existing = await conn.fetchrow(
                "SELECT id FROM users WHERE email = $1", inv["email"]
            )
            if existing:
                user_id: UUID = existing["id"]
            else:
                row = await conn.fetchrow(
                    """
                    INSERT INTO users (email, name, password_hash)
                    VALUES ($1, $2, $3)
                    RETURNING id
                    """,
                    inv["email"],
                    data.name,
                    hash_password(data.password),
                )
                user_id = row["id"]

            # ── 2. Liaison user → group_member ────────────────────────────
            await conn.execute(
                """
                UPDATE group_members
                SET user_id   = $1,
                    status    = 'joined',
                    joined_at = NOW()
                WHERE id = $2
                """,
                user_id,
                inv["group_member_id"],
            )

            # ── 3. Engagement (pledge) ────────────────────────────────────
            await conn.execute(
                """
                INSERT INTO pledges
                    (group_id, member_id, amount, type, status,
                     interest_rate, duration_months, notes)
                VALUES ($1, $2, $3, $4, 'confirmed', $5, $6, $7)
                ON CONFLICT (group_id, member_id) DO UPDATE
                    SET amount          = EXCLUDED.amount,
                        type            = EXCLUDED.type,
                        status          = 'confirmed',
                        interest_rate   = EXCLUDED.interest_rate,
                        duration_months = EXCLUDED.duration_months,
                        notes           = EXCLUDED.notes,
                        updated_at      = NOW()
                """,
                inv["group_id"],
                inv["group_member_id"],
                data.amount,
                data.type.value,
                data.interest_rate,
                data.duration_months,
                data.notes,
            )

            # ── 4. Token consommé ─────────────────────────────────────────
            await conn.execute(
                "UPDATE invitation_tokens SET used_at = NOW() WHERE id = $1",
                inv["token_id"],
            )

    return {
        "success":      True,
        "access_token": create_access_token(str(user_id)),
        "token_type":   "bearer",
    }
