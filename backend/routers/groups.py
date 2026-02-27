import os
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from ..database import get_db
from ..deps import get_current_user_id
from ..email_service import send_invitation_email
from ..schemas import (
    GroupCreate,
    GroupDashboard,
    GroupOut,
    GroupUpdate,
    MemberInvite,
)
from ..security import generate_invite_token

router = APIRouter(prefix="/groups", tags=["groups"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
INVITE_EXPIRE_HOURS = 72

# Champs autorisés pour le PATCH (whitelist contre injection)
_UPDATABLE_FIELDS = {"name", "description", "goal_amount", "deadline", "status"}


# ── Liste & création ──────────────────────────────────────────────────────────

@router.get("/dashboard")
async def list_groups_dashboard(
    user_id: UUID = Depends(get_current_user_id),
) -> list[dict]:
    """
    Retourne la vue consolidée de tous les groupes du porteur connecté,
    triée du plus récent au plus ancien.
    """
    async with get_db() as conn:
        rows = await conn.fetch(
            """
            SELECT gd.*
            FROM group_dashboard gd
            JOIN family_groups fg ON fg.id = gd.group_id
            WHERE gd.owner_id = $1
            ORDER BY fg.created_at DESC
            """,
            user_id,
        )
    return [dict(r) for r in rows]


@router.post("", response_model=GroupOut, status_code=201)
async def create_group(
    data: GroupCreate,
    user_id: UUID = Depends(get_current_user_id),
) -> dict:
    """Crée un groupe familial et ajoute le porteur comme membre owner."""
    async with get_db() as conn:
        async with conn.transaction():
            group = await conn.fetchrow(
                """
                INSERT INTO family_groups
                    (owner_id, name, description, goal_amount, currency, deadline)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
                """,
                user_id,
                data.name,
                data.description,
                data.goal_amount,
                data.currency,
                data.deadline,
            )

            # Le porteur devient automatiquement membre "owner"
            await conn.execute(
                """
                INSERT INTO group_members
                    (group_id, user_id, invited_by, role, status, joined_at)
                VALUES ($1, $2, $2, 'owner', 'joined', NOW())
                """,
                group["id"],
                user_id,
            )

    return dict(group)


# ── Lecture & modification d'un groupe ───────────────────────────────────────

@router.get("/{group_id}", response_model=GroupOut)
async def get_group(
    group_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
) -> dict:
    async with get_db() as conn:
        group = await conn.fetchrow(
            "SELECT * FROM family_groups WHERE id = $1 AND owner_id = $2",
            group_id,
            user_id,
        )

    if not group:
        raise HTTPException(404, "Groupe introuvable.")

    return dict(group)


@router.patch("/{group_id}", response_model=GroupOut)
async def update_group(
    group_id: UUID,
    data: GroupUpdate,
    user_id: UUID = Depends(get_current_user_id),
) -> dict:
    # Seulement les champs fournis et dans la whitelist
    updates = {
        k: v
        for k, v in data.model_dump(exclude_none=True).items()
        if k in _UPDATABLE_FIELDS
    }
    if not updates:
        raise HTTPException(400, "Aucune modification à apporter.")

    async with get_db() as conn:
        if not await conn.fetchrow(
            "SELECT id FROM family_groups WHERE id = $1 AND owner_id = $2",
            group_id,
            user_id,
        ):
            raise HTTPException(404, "Groupe introuvable.")

        fields = list(updates.keys())
        values = list(updates.values())
        set_clause = ", ".join(f"{f} = ${i + 2}" for i, f in enumerate(fields))

        group = await conn.fetchrow(
            f"UPDATE family_groups SET {set_clause} WHERE id = $1 RETURNING *",
            group_id,
            *values,
        )

    return dict(group)


# ── Dashboard d'un groupe ─────────────────────────────────────────────────────

@router.get("/{group_id}/dashboard", response_model=GroupDashboard)
async def get_group_dashboard(
    group_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
) -> dict:
    """Vue consolidée : montants, membres, progression — porteur uniquement."""
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM group_dashboard WHERE group_id = $1 AND owner_id = $2",
            group_id,
            user_id,
        )

    if not row:
        raise HTTPException(404, "Groupe introuvable.")

    return dict(row)


# ── Membres ───────────────────────────────────────────────────────────────────

@router.get("/{group_id}/members")
async def list_members(
    group_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
) -> list[dict]:
    """
    Liste les membres du groupe avec leur engagement.
    Les montants individuels ne sont visibles que par le porteur.
    """
    async with get_db() as conn:
        if not await conn.fetchrow(
            "SELECT id FROM family_groups WHERE id = $1 AND owner_id = $2",
            group_id,
            user_id,
        ):
            raise HTTPException(403, "Accès refusé.")

        rows = await conn.fetch(
            """
            SELECT
                gm.id,
                gm.user_id,
                gm.status      AS member_status,
                gm.joined_at,
                u.name,
                u.email,
                p.amount       AS pledge_amount,
                p.type         AS pledge_type,
                p.status       AS pledge_status
            FROM group_members gm
            LEFT JOIN users   u ON u.id  = gm.user_id
            LEFT JOIN pledges p ON p.member_id = gm.id
            WHERE gm.group_id = $1
              AND gm.role     = 'member'
            ORDER BY gm.invited_at
            """,
            group_id,
        )

    return [dict(r) for r in rows]


@router.post("/{group_id}/members", status_code=201)
async def invite_member(
    group_id: UUID,
    data: MemberInvite,
    user_id: UUID = Depends(get_current_user_id),
) -> dict:
    """
    Invite un proche :
    1. Crée un enregistrement group_member (sans user_id)
    2. Génère un token d'invitation sécurisé (72 h)
    3. Envoie l'email d'invitation
    """
    async with get_db() as conn:
        group = await conn.fetchrow(
            "SELECT id, name FROM family_groups WHERE id = $1 AND owner_id = $2",
            group_id,
            user_id,
        )
        if not group:
            raise HTTPException(404, "Groupe introuvable.")

        # Vérifier que cet email n'a pas déjà été invité
        already = await conn.fetchrow(
            """
            SELECT it.id FROM invitation_tokens it
            WHERE it.group_id = $1 AND it.email = $2
            """,
            group_id,
            data.email,
        )
        if already:
            raise HTTPException(409, "Cet email a déjà été invité dans ce groupe.")

        async with conn.transaction():
            member = await conn.fetchrow(
                """
                INSERT INTO group_members (group_id, invited_by, role, status)
                VALUES ($1, $2, 'member', 'invited')
                RETURNING id
                """,
                group_id,
                user_id,
            )

            plain_token, token_hash = generate_invite_token()
            expires_at = datetime.utcnow() + timedelta(hours=INVITE_EXPIRE_HOURS)

            await conn.execute(
                """
                INSERT INTO invitation_tokens
                    (group_id, group_member_id, email, name, token_hash, expires_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                group_id,
                member["id"],
                data.email,
                data.name,
                token_hash,
                expires_at,
            )

    invite_url = f"{FRONTEND_URL}/invite/{plain_token}"
    await send_invitation_email(data.email, data.name, group["name"], invite_url)

    return {"success": True, "member_id": str(member["id"])}
