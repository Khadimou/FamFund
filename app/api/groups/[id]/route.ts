import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.FASTAPI_URL ?? 'http://localhost:8000'

function getToken() {
  return cookies().get('auth_token')?.value
}

type Context = { params: { id: string } }

export async function GET(_req: Request, { params }: Context) {
  const token = getToken()
  if (!token) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const upstream = await fetch(`${API}/groups/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}

export async function PATCH(request: Request, { params }: Context) {
  const token = getToken()
  if (!token) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const body = await request.json()
  const upstream = await fetch(`${API}/groups/${params.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
