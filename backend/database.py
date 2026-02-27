import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

import asyncpg

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/familyfund",
)

MIGRATIONS_DIR = Path(__file__).parent / "migrations"

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
    return _pool


@asynccontextmanager
async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn


# ── MIGRATIONS ────────────────────────────────────────────────────────────────

async def init_db() -> None:
    """
    Crée la table de suivi, puis applique les migrations SQL manquantes
    dans l'ordre alphabétique des fichiers dans /migrations.
    """
    async with get_db() as conn:
        # Table de suivi (bootstrap, pas dans les migrations)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS _migrations (
                id         SERIAL PRIMARY KEY,
                name       VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)

        applied: set[str] = {
            row["name"]
            for row in await conn.fetch("SELECT name FROM _migrations")
        }

        sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))

        for sql_file in sql_files:
            name = sql_file.stem  # ex: "001_initial_schema"
            if name in applied:
                continue

            sql = sql_file.read_text(encoding="utf-8")

            # Exécution dans une transaction pour rollback automatique en cas d'erreur
            async with conn.transaction():
                await conn.execute(sql)
                await conn.execute(
                    "INSERT INTO _migrations (name) VALUES ($1)", name
                )

            print(f"[migrations] Applied: {name}")
