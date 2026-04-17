"""
Schémas Pydantic pour toutes les entités FamilyFund.
Séparation nette entre schémas d'entrée (Create/Update) et de sortie (Out).
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ── ENUMS (miroir des types PostgreSQL) ───────────────────────────────────────

class GroupStatus(str, Enum):
    draft   = "draft"
    active  = "active"
    closed  = "closed"
    funded  = "funded"


class MemberRole(str, Enum):
    owner  = "owner"
    member = "member"


class MemberStatus(str, Enum):
    invited  = "invited"
    joined   = "joined"
    declined = "declined"


class PledgeType(str, Enum):
    loan   = "loan"
    gift   = "gift"
    equity = "equity"


class PledgeStatus(str, Enum):
    draft     = "draft"
    confirmed = "confirmed"
    signed    = "signed"
    funded    = "funded"
    cancelled = "cancelled"


class DocumentType(str, Enum):
    loan_agreement   = "loan_agreement"
    gift_declaration = "gift_declaration"
    term_sheet       = "term_sheet"
    other            = "other"


# ── USERS ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email:    EmailStr
    name:     str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, description="Mot de passe en clair (hashé avant stockage)")
    phone:    Optional[str] = Field(None, max_length=20)


class UserOut(BaseModel):
    id:             UUID
    email:          str
    name:           str
    phone:          Optional[str]
    email_verified: bool
    created_at:     datetime

    model_config = {"from_attributes": True}


# ── FAMILY GROUPS ─────────────────────────────────────────────────────────────

class GroupCreate(BaseModel):
    name:        str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    goal_amount: Decimal = Field(..., gt=0,
                                 description="Montant cible en euros")
    currency:    str = Field(default="EUR", pattern=r"^[A-Z]{3}$")
    deadline:    Optional[date] = None


class GroupUpdate(BaseModel):
    name:        Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    goal_amount: Optional[Decimal] = Field(None, gt=0)
    deadline:    Optional[date] = None
    status:      Optional[GroupStatus] = None


class GroupOut(BaseModel):
    id:          UUID
    owner_id:    UUID
    name:        str
    description: Optional[str]
    goal_amount: Decimal
    currency:    str
    status:      GroupStatus
    deadline:    Optional[date]
    created_at:  datetime
    updated_at:  datetime

    model_config = {"from_attributes": True}


class GroupDashboard(BaseModel):
    """Vue consolidée pour le porteur — issue de la vue group_dashboard."""
    group_id:        UUID
    owner_id:        UUID
    name:            str
    goal_amount:     Decimal
    currency:        str
    status:          GroupStatus
    deadline:        Optional[date]
    # Membres
    member_count:    int
    joined_count:    int
    pending_count:   int
    # Engagements
    pledge_count:    int
    pledged_amount:  Decimal
    funded_amount:   Decimal
    completion_pct:  float

    model_config = {"from_attributes": True}


# ── GROUP MEMBERS ─────────────────────────────────────────────────────────────

class MemberInvite(BaseModel):
    """Corps de la requête pour inviter un membre."""
    email: EmailStr
    name:  str = Field(..., min_length=2, max_length=255,
                       description="Prénom + nom (pré-rempli dans l'invitation)")


class MemberOut(BaseModel):
    id:         UUID
    group_id:   UUID
    user_id:    Optional[UUID]
    role:       MemberRole
    status:     MemberStatus
    invited_at: datetime
    joined_at:  Optional[datetime]

    model_config = {"from_attributes": True}


# ── PLEDGES ───────────────────────────────────────────────────────────────────

class PledgeCreate(BaseModel):
    amount:          Decimal = Field(..., gt=0)
    type:            PledgeType = PledgeType.loan
    notes:           Optional[str] = Field(None, description="Note privée du membre")
    interest_rate:   Optional[Decimal] = Field(
        None, ge=0,
        description="Taux annuel en % (prêt uniquement)"
    )
    duration_months: Optional[int] = Field(
        None, gt=0, le=360,
        description="Durée en mois (prêt uniquement)"
    )


class PledgeUpdate(BaseModel):
    amount:          Optional[Decimal] = Field(None, gt=0)
    type:            Optional[PledgeType] = None
    status:          Optional[PledgeStatus] = None
    notes:           Optional[str] = None
    interest_rate:   Optional[Decimal] = Field(None, ge=0)
    duration_months: Optional[int] = Field(None, gt=0, le=360)


class PledgeOut(BaseModel):
    id:              UUID
    group_id:        UUID
    member_id:       UUID
    amount:          Decimal
    type:            PledgeType
    status:          PledgeStatus
    notes:           Optional[str]
    interest_rate:   Optional[Decimal]
    duration_months: Optional[int]
    created_at:      datetime
    updated_at:      datetime

    model_config = {"from_attributes": True}


class MemberSummary(BaseModel):
    """Vue membre — ce qu'un invité voit de son propre engagement."""
    member_id:           UUID
    group_id:            UUID
    user_id:             Optional[UUID]
    member_status:       MemberStatus
    joined_at:           Optional[datetime]
    group_name:          str
    goal_amount:         Decimal
    currency:            str
    group_status:        GroupStatus
    deadline:            Optional[date]
    pledge_id:           Optional[UUID]
    pledge_amount:       Optional[Decimal]
    pledge_type:         Optional[PledgeType]
    pledge_status:       Optional[PledgeStatus]
    interest_rate:       Optional[Decimal]
    duration_months:     Optional[int]
    group_completion_pct: float

    model_config = {"from_attributes": True}


# ── DOCUMENTS ─────────────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id:          UUID
    group_id:    UUID
    pledge_id:   Optional[UUID]
    type:        DocumentType
    name:        str
    storage_url: str
    signed_at:   Optional[datetime]
    created_at:  datetime

    model_config = {"from_attributes": True}


# ── INVITATION ────────────────────────────────────────────────────────────────

class InvitationAccept(BaseModel):
    """Corps de la requête quand un membre accepte son invitation."""
    name:            str     = Field(..., min_length=2, max_length=255)
    password:        str     = Field(..., min_length=8)
    amount:          Decimal = Field(..., gt=0)
    type:            PledgeType = PledgeType.loan
    interest_rate:   Optional[Decimal] = Field(None, ge=0)
    duration_months: Optional[int]     = Field(None, gt=0, le=360)
    notes:           Optional[str]     = None
