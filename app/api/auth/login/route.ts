import { NextResponse } from 'next/server'

const API = process.env.FASTAPI_URL ?? 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const upstream = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await upstream.json()
    if (!upstream.ok) {
      return NextResponse.json({ error: data.detail ?? 'Identifiants incorrects.' }, { status: upstream.status })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('auth_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Service indisponible.' }, { status: 503 })
  }
}
