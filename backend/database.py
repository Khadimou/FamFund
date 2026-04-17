import os
import ssl
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator
from urllib.parse import urlparse, unquote

import asyncpg
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/familyfund",
)

MIGRATIONS_DIR = Path(__file__).parent / "migrations"

_pool: asyncpg.Pool | None = None


def _parse_db_url(url: str) -> dict:
    """Parse DATABASE_URL en paramètres séparés pour gérer les mots de passe avec caractères spéciaux."""
    parsed = urlparse(url)
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "user": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
        "database": parsed.path.lstrip("/"),
    }


def _make_ssl_context() -> ssl.SSLContext:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        params = _parse_db_url(DATABASE_URL)
        _pool = await asyncpg.create_pool(
            **params,
            min_size=0,
            max_size=5,
            ssl=_make_ssl_context(),
            statement_cache_size=0,
            max_inactive_connection_lifetime=60,
            command_timeout=30,
        )
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
    try:
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

                async with conn.transaction():
                    await conn.execute(sql)
                    await conn.execute(
                        "INSERT INTO _migrations (name) VALUES ($1)", name
                    )

                print(f"[migrations] Applied: {name}")
    except Exception as e:
        print(f"[migrations] Warning: {e} — startup continues")
