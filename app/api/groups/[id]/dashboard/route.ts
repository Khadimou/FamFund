import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.FASTAPI_URL ?? 'http://localhost:8000'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const token = cookies().get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const upstream = await fetch(`${API}/groups/${params.id}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
