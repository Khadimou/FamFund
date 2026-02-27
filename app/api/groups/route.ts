import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.FASTAPI_URL ?? 'http://localhost:8000'

function getToken() {
  return cookies().get('auth_token')?.value
}

export async function GET() {
  const token = getToken()
  if (!token) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  try {
    const upstream = await fetch(`${API}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch {
    return NextResponse.json({ error: 'Service indisponible.' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  const token = getToken()
  if (!token) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  try {
    const body = await request.json()
    const upstream = await fetch(`${API}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch {
    return NextResponse.json({ error: 'Service indisponible.' }, { status: 503 })
  }
}
