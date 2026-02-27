from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .models import WaitlistEntry, WaitlistResponse
from .database import get_db
from .routers import auth, groups, invite


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="FamilyFund API", version="0.2.0", lifespan=lifespan)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://familyfund.fr",
        "https://www.familyfund.fr",
    ],
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(invite.router)

# ── Waitlist (landing page) ───────────────────────────────────────────────────

@app.post("/waitlist", response_model=WaitlistResponse)
async def join_waitlist(entry: WaitlistEntry) -> WaitlistResponse:
    async with get_db() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM waitlist WHERE email = $1", entry.email
        )
        if existing:
            position = await conn.fetchval(
                "SELECT COUNT(*) FROM waitlist WHERE id <= $1", existing["id"]
            )
            return WaitlistResponse(success=True, position=int(position))

        new_row = await conn.fetchrow(
            "INSERT INTO waitlist (email, source) VALUES ($1, $2) RETURNING id",
            entry.email,
            entry.source,
        )
        position = await conn.fetchval(
            "SELECT COUNT(*) FROM waitlist WHERE id <= $1", new_row["id"]
        )
        return WaitlistResponse(success=True, position=int(position))


# ── Waitlist count (social proof) ─────────────────────────────────────────────

@app.get("/waitlist/count")
async def waitlist_count() -> dict:
    async with get_db() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM waitlist")
        return {"count": int(count)}


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
