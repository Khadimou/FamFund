-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  FamilyFund — Schéma initial PostgreSQL                         ║
-- ║  Migration 001                                                   ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Extension UUID (nécessaire pour gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMS ─────────────────────────────────────────────────────────────────────

CREATE TYPE group_status   AS ENUM ('draft', 'active', 'closed', 'funded');
CREATE TYPE member_role    AS ENUM ('owner', 'member');
CREATE TYPE member_status  AS ENUM ('invited', 'joined', 'declined');
CREATE TYPE pledge_type    AS ENUM ('loan', 'gift', 'equity');
CREATE TYPE pledge_status  AS ENUM ('draft', 'confirmed', 'signed', 'funded', 'cancelled');
CREATE TYPE document_type  AS ENUM (
  'loan_agreement',
  'gift_declaration',
  'term_sheet',
  'other'
);

-- ── TRIGGER updated_at (partagé par toutes les tables) ────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── TABLE : waitlist ──────────────────────────────────────────────────────────
-- Déjà créée par init_db(), on s'assure qu'elle existe.

CREATE TABLE IF NOT EXISTS waitlist (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  source     VARCHAR(100) NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (email);

-- ── TABLE : users ─────────────────────────────────────────────────────────────

CREATE TABLE users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  name           VARCHAR(255) NOT NULL,
  phone          VARCHAR(20),
  password_hash  TEXT        NOT NULL,
  email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TABLE : family_groups ─────────────────────────────────────────────────────

CREATE TABLE family_groups (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name         VARCHAR(255)  NOT NULL,
  description  TEXT,
  goal_amount  NUMERIC(12,2) NOT NULL CHECK (goal_amount > 0),
  currency     CHAR(3)       NOT NULL DEFAULT 'EUR',
  status       group_status  NOT NULL DEFAULT 'draft',
  deadline     DATE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_groups_owner  ON family_groups (owner_id);
CREATE INDEX idx_family_groups_status ON family_groups (status);

CREATE TRIGGER family_groups_updated_at
  BEFORE UPDATE ON family_groups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TABLE : group_members ─────────────────────────────────────────────────────
--
--  user_id est nullable : un membre peut être invité avant d'avoir un compte.
--  À la création du compte, on fait la jointure via invitation_tokens.email.

CREATE TABLE group_members (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID          NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id     UUID          REFERENCES users(id) ON DELETE SET NULL,
  invited_by  UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role        member_role   NOT NULL DEFAULT 'member',
  status      member_status NOT NULL DEFAULT 'invited',
  invited_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  joined_at   TIMESTAMPTZ,

  -- Un utilisateur enregistré ne peut rejoindre un groupe qu'une seule fois.
  CONSTRAINT uq_group_member UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_members_group  ON group_members (group_id);
CREATE INDEX idx_group_members_user   ON group_members (user_id);
CREATE INDEX idx_group_members_status ON group_members (group_id, status);

-- ── TABLE : invitation_tokens ─────────────────────────────────────────────────
--
--  Chaque invitation génère un token unique transmis par email.
--  Le token est hashé en base, seul le hash est stocké.

CREATE TABLE invitation_tokens (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID         NOT NULL REFERENCES family_groups(id)  ON DELETE CASCADE,
  group_member_id UUID         NOT NULL REFERENCES group_members(id)  ON DELETE CASCADE,
  email           VARCHAR(255) NOT NULL,
  name            VARCHAR(255) NOT NULL,          -- Prénom + nom de l'invité (pré-rempli)
  token_hash      VARCHAR(128) UNIQUE NOT NULL,   -- SHA-256 du token clair
  expires_at      TIMESTAMPTZ  NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_token_hash  ON invitation_tokens (token_hash);
CREATE INDEX idx_invitation_token_email ON invitation_tokens (email);

-- ── TABLE : pledges ───────────────────────────────────────────────────────────
--
--  Un seul engagement actif par membre par groupe (UNIQUE).
--  Pour les prêts : interest_rate (% annuel) + duration_months.
--  notes est visible uniquement du membre (champ privé).

CREATE TABLE pledges (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID          NOT NULL REFERENCES family_groups(id)  ON DELETE CASCADE,
  member_id       UUID          NOT NULL REFERENCES group_members(id)  ON DELETE CASCADE,
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  type            pledge_type   NOT NULL DEFAULT 'loan',
  status          pledge_status NOT NULL DEFAULT 'draft',
  notes           TEXT,
  interest_rate   NUMERIC(5,2)  CHECK (interest_rate >= 0),
  duration_months INTEGER       CHECK (duration_months > 0),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Un membre ne peut avoir qu'un seul engagement actif par groupe.
  CONSTRAINT uq_pledge_per_member UNIQUE (group_id, member_id)
);

CREATE INDEX idx_pledges_group  ON pledges (group_id);
CREATE INDEX idx_pledges_member ON pledges (member_id);
-- Index partiel pour les tableaux de bord (engagements actifs uniquement)
CREATE INDEX idx_pledges_active ON pledges (group_id, amount)
  WHERE status IN ('confirmed', 'signed', 'funded');

CREATE TRIGGER pledges_updated_at
  BEFORE UPDATE ON pledges
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TABLE : documents ─────────────────────────────────────────────────────────
--
--  pledge_id nullable : un document peut être lié au groupe entier
--  (ex: lettre d'intention) ou à un engagement précis (contrat de prêt).

CREATE TABLE documents (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID          NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  pledge_id   UUID          REFERENCES pledges(id) ON DELETE SET NULL,
  type        document_type NOT NULL DEFAULT 'other',
  name        VARCHAR(255)  NOT NULL,
  storage_url TEXT          NOT NULL,
  signed_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_group  ON documents (group_id);
CREATE INDEX idx_documents_pledge ON documents (pledge_id);

-- ── VUE : group_dashboard ─────────────────────────────────────────────────────
--
--  Lecture seule pour le porteur de projet.
--  Aggrège membres + engagements en une seule requête.

CREATE VIEW group_dashboard AS
SELECT
  fg.id                                                                   AS group_id,
  fg.owner_id,
  fg.name,
  fg.goal_amount,
  fg.currency,
  fg.status,
  fg.deadline,
  fg.created_at,

  -- Membres
  COUNT(DISTINCT gm.id)                                                   AS member_count,
  COUNT(DISTINCT gm.id) FILTER (WHERE gm.status = 'joined')              AS joined_count,
  COUNT(DISTINCT gm.id) FILTER (WHERE gm.status = 'invited')             AS pending_count,

  -- Engagements financiers
  COUNT(DISTINCT p.id)                                                    AS pledge_count,
  COALESCE(
    SUM(p.amount) FILTER (WHERE p.status IN ('confirmed', 'signed', 'funded')), 0
  )                                                                       AS pledged_amount,
  COALESCE(
    SUM(p.amount) FILTER (WHERE p.status = 'funded'), 0
  )                                                                       AS funded_amount,

  -- Taux de complétion (0-100)
  ROUND(
    COALESCE(
      SUM(p.amount) FILTER (WHERE p.status IN ('confirmed', 'signed', 'funded')), 0
    ) / NULLIF(fg.goal_amount, 0) * 100
  , 1)                                                                    AS completion_pct

FROM family_groups fg
LEFT JOIN group_members gm ON gm.group_id = fg.id AND gm.role = 'member'
LEFT JOIN pledges        p  ON p.group_id  = fg.id
GROUP BY fg.id;

-- ── VUE : member_summary ──────────────────────────────────────────────────────
--
--  Ce que voit un membre de son propre engagement (pas de données des autres).

CREATE VIEW member_summary AS
SELECT
  gm.id                        AS member_id,
  gm.group_id,
  gm.user_id,
  gm.status                    AS member_status,
  gm.joined_at,
  fg.name                      AS group_name,
  fg.goal_amount,
  fg.currency,
  fg.status                    AS group_status,
  fg.deadline,
  p.id                         AS pledge_id,
  p.amount                     AS pledge_amount,
  p.type                       AS pledge_type,
  p.status                     AS pledge_status,
  p.interest_rate,
  p.duration_months,
  -- Progression globale (sans révéler les montants des autres)
  ROUND(
    COALESCE(
      SUM(p2.amount) FILTER (WHERE p2.status IN ('confirmed', 'signed', 'funded')), 0
    ) / NULLIF(fg.goal_amount, 0) * 100
  , 0)                         AS group_completion_pct
FROM group_members gm
JOIN family_groups fg ON fg.id = gm.group_id
LEFT JOIN pledges p   ON p.member_id = gm.id
LEFT JOIN pledges p2  ON p2.group_id = gm.group_id
GROUP BY gm.id, fg.id, p.id;

-- Fin de la migration 001_initial_schema
