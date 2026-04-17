#!/usr/bin/env python3
"""
Seed script — Comptes contributeurs de démonstration FamilyFund
================================================================
Crée (ou réutilise s'ils existent déjà) :
  - Un propriétaire de groupe démo (demo.owner@familyfund.fr)
  - Un groupe familial démo en CAD (10 000 $ objectif)
  - Sarah Any  — prêt 3 000 $ CAD, disponible immédiatement, statut : confirmé
  - Monique Any — prêt 1 500 $ CAD, disponible dans 1 mois,    statut : confirmé

Usage :
  DATABASE_URL=postgresql://user:pass@host/db python scripts/seed_demo.py

Variables optionnelles :
  DEMO_GROUP_ID   → utilise un groupe existant plutôt que d'en créer un
  DEMO_OWNER_ID   → utilise un propriétaire existant (ignoré si DEMO_GROUP_ID est fourni)
"""

import asyncio
import os
import sys

try:
    import asyncpg
except ImportError:
    print("Erreur : asyncpg manquant. Installez-le avec : pip install asyncpg")
    sys.exit(1)

try:
    from passlib.context import CryptContext
except ImportError:
    print("Erreur : passlib manquant. Installez-le avec : pip install passlib[bcrypt]")
    sys.exit(1)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Erreur : la variable d'environnement DATABASE_URL est requise.")
    print("  Exemple : DATABASE_URL=postgresql://user:pass@host/db python scripts/seed_demo.py")
    sys.exit(1)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Données des contributeurs démo ───────────────────────────────────────────

DEMO_CONTRIBUTORS = [
    {
        "name": "Sarah Any",
        "email": "demo.sarah@familyfund.fr",
        "password": "Demo2026!",
        "pledge": {
            "amount": 3000.00,
            "type": "loan",
            "status": "confirmed",
            "notes": "Disponibilité : Immédiatement",
        },
    },
    {
        "name": "Monique Any",
        "email": "demo.monique@familyfund.fr",
        "password": "Demo2026!",
        "pledge": {
            "amount": 1500.00,
            "type": "loan",
            "status": "confirmed",
            "notes": "Disponibilité : Dans 1 mois",
        },
    },
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def ok(msg: str) -> None:
    print(f"  ✓ {msg}")

def info(msg: str) -> None:
    print(f"  → {msg}")


# ── Seed principal ────────────────────────────────────────────────────────────

async def seed() -> None:
    print(f"\nConnexion à la base de données…")
    conn = await asyncpg.connect(DATABASE_URL)
    print("Connecté.\n")

    try:
        demo_group_id = os.getenv("DEMO_GROUP_ID")
        demo_owner_id = os.getenv("DEMO_OWNER_ID")

        # ── 1. Propriétaire du groupe ─────────────────────────────────────────

        if demo_group_id:
            # Récupère le propriétaire depuis le groupe existant
            group_row = await conn.fetchrow(
                "SELECT id, owner_id, name FROM family_groups WHERE id = $1",
                demo_group_id,
            )
            if not group_row:
                print(f"Erreur : groupe {demo_group_id} introuvable.")
                return
            demo_owner_id = str(group_row["owner_id"])
            info(f"Groupe existant utilisé : {group_row['name']} ({demo_group_id})")

        else:
            # Crée ou récupère le propriétaire démo
            OWNER_EMAIL = "demo.owner@familyfund.fr"

            if demo_owner_id:
                owner_row = await conn.fetchrow(
                    "SELECT id FROM users WHERE id = $1", demo_owner_id
                )
                if not owner_row:
                    print(f"Erreur : utilisateur owner {demo_owner_id} introuvable.")
                    return
                info(f"Owner existant utilisé : {demo_owner_id}")
            else:
                owner_row = await conn.fetchrow(
                    "SELECT id FROM users WHERE email = $1", OWNER_EMAIL
                )
                if owner_row:
                    demo_owner_id = str(owner_row["id"])
                    info(f"Owner démo existant : {OWNER_EMAIL} ({demo_owner_id})")
                else:
                    owner_row = await conn.fetchrow(
                        """
                        INSERT INTO users (email, name, password_hash, email_verified)
                        VALUES ($1, $2, $3, TRUE)
                        RETURNING id
                        """,
                        OWNER_EMAIL,
                        "Demo Owner",
                        pwd_context.hash("Demo2026!"),
                    )
                    demo_owner_id = str(owner_row["id"])
                    ok(f"Owner démo créé : {OWNER_EMAIL} ({demo_owner_id})")

            # ── 2. Groupe familial démo ───────────────────────────────────────

            group_row = await conn.fetchrow(
                """
                SELECT id FROM family_groups
                WHERE owner_id = $1 AND name = 'Groupe Démo FamilyFund'
                """,
                demo_owner_id,
            )
            if group_row:
                demo_group_id = str(group_row["id"])
                info(f"Groupe démo existant : {demo_group_id}")
            else:
                async with conn.transaction():
                    group_row = await conn.fetchrow(
                        """
                        INSERT INTO family_groups
                            (owner_id, name, description, goal_amount, currency, status)
                        VALUES ($1, $2, $3, $4, $5, 'active')
                        RETURNING id
                        """,
                        demo_owner_id,
                        "Groupe Démo FamilyFund",
                        "Groupe de démonstration pour présenter FamilyFund à des investisseurs.",
                        10000.00,
                        "CAD",
                    )
                    # L'owner est automatiquement membre
                    await conn.execute(
                        """
                        INSERT INTO group_members
                            (group_id, user_id, invited_by, role, status, joined_at)
                        VALUES ($1, $2, $2, 'owner', 'joined', NOW())
                        """,
                        group_row["id"],
                        demo_owner_id,
                    )
                demo_group_id = str(group_row["id"])
                ok(f"Groupe démo créé : {demo_group_id}")

        # ── 3. Contributeurs ──────────────────────────────────────────────────

        print()
        for contributor in DEMO_CONTRIBUTORS:
            print(f"[{contributor['name']}]")

            # Utilisateur
            user_row = await conn.fetchrow(
                "SELECT id FROM users WHERE email = $1", contributor["email"]
            )
            if user_row:
                user_id = str(user_row["id"])
                info(f"Utilisateur existant : {contributor['email']} ({user_id})")
                # Met à jour le mot de passe au cas où
                await conn.execute(
                    "UPDATE users SET password_hash = $1 WHERE id = $2",
                    pwd_context.hash(contributor["password"]),
                    user_id,
                )
            else:
                user_row = await conn.fetchrow(
                    """
                    INSERT INTO users (email, name, password_hash, email_verified)
                    VALUES ($1, $2, $3, TRUE)
                    RETURNING id
                    """,
                    contributor["email"],
                    contributor["name"],
                    pwd_context.hash(contributor["password"]),
                )
                user_id = str(user_row["id"])
                ok(f"Utilisateur créé : {contributor['email']} ({user_id})")

            # Membership
            member_row = await conn.fetchrow(
                """
                SELECT id FROM group_members
                WHERE group_id = $1 AND user_id = $2
                """,
                demo_group_id,
                user_id,
            )
            if member_row:
                member_id = str(member_row["id"])
                # S'assure que le statut est 'joined'
                await conn.execute(
                    "UPDATE group_members SET status = 'joined', joined_at = COALESCE(joined_at, NOW()) WHERE id = $1",
                    member_id,
                )
                info(f"Membership existant : {member_id}")
            else:
                member_row = await conn.fetchrow(
                    """
                    INSERT INTO group_members
                        (group_id, user_id, invited_by, role, status, joined_at)
                    VALUES ($1, $2, $3, 'member', 'joined', NOW())
                    RETURNING id
                    """,
                    demo_group_id,
                    user_id,
                    demo_owner_id,
                )
                member_id = str(member_row["id"])
                ok(f"Membre ajouté au groupe : {member_id}")

            # Pledge
            p = contributor["pledge"]
            pledge_row = await conn.fetchrow(
                "SELECT id FROM pledges WHERE group_id = $1 AND member_id = $2",
                demo_group_id,
                member_id,
            )
            if pledge_row:
                await conn.execute(
                    """
                    UPDATE pledges
                    SET amount = $1, type = $2, status = $3, notes = $4
                    WHERE id = $5
                    """,
                    p["amount"],
                    p["type"],
                    p["status"],
                    p["notes"],
                    str(pledge_row["id"]),
                )
                info(f"Engagement mis à jour : {pledge_row['id']}")
            else:
                pledge_row = await conn.fetchrow(
                    """
                    INSERT INTO pledges (group_id, member_id, amount, type, status, notes)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id
                    """,
                    demo_group_id,
                    member_id,
                    p["amount"],
                    p["type"],
                    p["status"],
                    p["notes"],
                )
                ok(
                    f"Engagement créé : {p['amount']} $ CAD ({p['type']}) — "
                    f"{p['notes']} ({pledge_row['id']})"
                )
            print()

        # ── Résumé ────────────────────────────────────────────────────────────

        print("=" * 60)
        print("Seed terminé avec succès !")
        print()
        print(f"  Groupe ID  : {demo_group_id}")
        print()
        print("  Compte 1 — Sarah Any")
        print("    Email    : demo.sarah@familyfund.fr")
        print("    Mot de passe : Demo2026!")
        print("    Engagement : 3 000 $ CAD · Prêt · Immédiatement · Confirmé")
        print()
        print("  Compte 2 — Monique Any")
        print("    Email    : demo.monique@familyfund.fr")
        print("    Mot de passe : Demo2026!")
        print("    Engagement : 1 500 $ CAD · Prêt · Dans 1 mois · Confirmé")
        print("=" * 60)

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
