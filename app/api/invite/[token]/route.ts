import { NextResponse } from 'next/server'

const API = process.env.FASTAPI_URL ?? 'http://localhost:8000'

type Context = { params: { token: string } }

/** Valide le token et retourne les infos du groupe/invitation */
export async function GET(_req: Request, { params }: Context) {
  const upstream = await fetch(`${API}/invite/${params.token}`, {
    cache: 'no-store',
  })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}

/** Soumet l'engagement + crée le compte du membre */
export async function POST(request: Request, { params }: Context) {
  try {
    const body = await request.json()

    const upstream = await fetch(`${API}/invite/${params.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await upstream.json()
    if (!upstream.ok) {
      return NextResponse.json({ error: data.detail ?? 'Erreur.' }, { status: upstream.status })
    }

    // Si FastAPI renvoie un access_token → connexion auto
    if (data.access_token) {
      const response = NextResponse.json({ success: true, access_token: data.access_token })
      response.cookies.set('auth_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      return response
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Service indisponible.' }, { status: 503 })
  }
}
