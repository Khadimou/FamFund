# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Frontend (Next.js)**
```bash
npm run dev       # dev server on :3000
npm run build     # production build
npm run lint      # ESLint via next lint
```

**Backend (FastAPI)**
```bash
cd backend
uvicorn main:app --reload            # dev server on :8000
uvicorn familyfund.backend.main:app  # if running from root
```

**Database migrations**
Add a numbered SQL file in `backend/migrations/` (e.g. `003_add_column.sql`). Migrations run automatically on FastAPI startup in alphabetical order — no CLI command needed.

## Architecture

This is a two-tier app: a **Next.js 14** frontend and a **FastAPI** backend, running as separate processes.

### Data split: two databases

| Store | What it holds | Access |
|-------|--------------|--------|
| **Supabase** (Postgres) | Waitlist signups only | Next.js API routes via `lib/supabase.ts` with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| **PostgreSQL** (asyncpg) | All app data (users, groups, pledges, invites) | FastAPI only, via `backend/database.py` pool |

The Next.js app **never** talks directly to the app database — all app reads/writes go through `lib/api.ts` (`apiGet`, `apiPost`, `apiPatch`, `apiDelete`) which proxy to `FASTAPI_URL` (default `http://localhost:8000`).

### Authentication flow

1. User submits credentials → Next.js `/api/auth/login` proxies to FastAPI `/auth/login`
2. FastAPI returns a JWT; the Next.js route stores it in an **HTTP-only cookie** (`auth_token`, 7-day TTL)
3. Server Components call `requireAuth()` (`lib/auth.ts`) to read the cookie and pass the token as a Bearer header to FastAPI
4. Client Components are not used in the authenticated app section — all protected pages are Server Components with `export const dynamic = 'force-dynamic'`

### Route groups

- `app/(app)/` — authenticated app (dashboard, group detail, new group). Protected by `requireAuth()` at the top of each page.
- `app/(auth)/` — login / register pages
- `app/` root — public landing page (`page.tsx`)
- `app/api/` — Next.js Route Handlers (waitlist via Supabase, contact via Brevo, auth proxy to FastAPI, invite token resolution)

### Landing page components

All in `components/landing/`. They are Server Components by default; only add `'use client'` if they need hooks. The waitlist form posts to `/api/waitlist` (Supabase). Contact form posts to `/api/contact` (Brevo transactional email).

### Backend structure

`backend/routers/` holds auth, groups, and invite routers. `backend/security.py` handles JWT signing/verification. `backend/deps.py` provides the FastAPI dependency for extracting the current user from the Bearer token.

## Environment variables

**`.env.local`** (Next.js)
```
FASTAPI_URL=http://localhost:8000
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
BREVO_API_KEY=...
CONTACT_EMAIL=contact@familyfund.fr   # optional, fallback used
```

**`backend/.env`**
```
DATABASE_URL=postgresql://user:password@localhost:5432/familyfund
SECRET_KEY=...   # JWT signing key
```
